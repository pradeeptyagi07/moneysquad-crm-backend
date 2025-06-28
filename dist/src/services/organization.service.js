"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavoriteBranchesService = exports.getBranchFeedbacks = exports.createFeedback = exports.getReaction = exports.upsertReaction = exports.getCitiesByStateId = exports.getStates = exports.getRecentViewsService = exports.createRecentViewService = exports.getBranchDetailsService = exports.getBranchesService = exports.getOrganizationsService = void 0;
const client_1 = require("@prisma/client");
const helper_1 = require("../utils/helper");
const prisma = new client_1.PrismaClient();
const PAGE_SIZE = 10; // Max 10 results per page
const getOrganizationsService = async (page, state, city, type) => {
    try {
        const organizationFilter = { status: true };
        const normalizedState = state?.trim().toLowerCase();
        const normalizedCity = city?.trim().toLowerCase();
        const normalizedType = type?.trim().toLowerCase();
        if (normalizedState || normalizedCity || normalizedType) {
            organizationFilter.branches = {
                some: {
                    ...(normalizedType ? { type: { equals: normalizedType, mode: "insensitive" } } : {}),
                    ...(normalizedState ? { state: { equals: normalizedState, mode: "insensitive" } } : {}),
                    ...(normalizedCity ? { city: { equals: normalizedCity, mode: "insensitive" } } : {})
                }
            };
        }
        // Count total organizations matching filters
        const totalOrganizations = await prisma.organization.count({ where: organizationFilter });
        const organizations = await prisma.organization.findMany({
            where: organizationFilter,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        });
        const organizationsWithFilteredBranchCount = await Promise.all(organizations.map(async (org) => {
            const branchCount = await prisma.branch.count({
                where: {
                    organizationId: org.id,
                    ...(normalizedType ? { type: { equals: normalizedType, mode: "insensitive" } } : {}),
                    ...(normalizedState ? { state: { equals: normalizedState, mode: "insensitive" } } : {}),
                    ...(normalizedCity ? { city: { equals: normalizedCity, mode: "insensitive" } } : {}),
                },
            });
            return {
                ...org,
                _count: {
                    branches: branchCount,
                },
            };
        }));
        return {
            total: totalOrganizations,
            page,
            totalPages: Math.ceil(totalOrganizations / PAGE_SIZE),
            data: organizationsWithFilteredBranchCount
        };
    }
    catch (error) {
        console.error("Error fetching organizations:", error);
        throw new Error("Database query failed");
    }
};
exports.getOrganizationsService = getOrganizationsService;
const getBranchesService = async (organizationId, state, city) => {
    try {
        const organizationFilter = { status: true };
        if (organizationId) {
            organizationFilter.organizationId = organizationId;
        }
        if (state || city) {
            organizationFilter.AND = [];
            if (state) {
                organizationFilter.AND.push({
                    state: {
                        contains: state.trim(),
                        mode: "insensitive",
                    },
                });
            }
            if (city) {
                organizationFilter.AND.push({
                    city: {
                        contains: city.trim(),
                        mode: "insensitive",
                    },
                });
            }
        }
        const branches = await prisma.branch.findMany({
            where: organizationFilter,
        });
        return (0, helper_1.safeJson)(branches);
    }
    catch (error) {
        console.error("Error fetching branches:", error);
        throw new Error("Database query failed");
    }
};
exports.getBranchesService = getBranchesService;
const getBranchDetailsService = async (userId, organizationId, branchId) => {
    try {
        const branch = await prisma.branch.findFirst({
            where: {
                id: branchId,
                organizationId: organizationId
            },
            include: {
                organization: true // Include organization details
            }
        });
        if (!branch)
            return null;
        // Favorite count (done separately since it's boolean)
        const [reaction, userFeedback] = await prisma.$transaction([
            prisma.branchReaction.findFirst({
                where: { branchId, userId }
            }),
            prisma.feedback.findFirst({
                where: { branchId, userId },
                select: {
                    id: true,
                    message: true,
                    anonymous: true,
                    createdAt: true
                }
            })
        ]);
        const response = {
            ...branch,
            reaction: reaction
                ? {
                    reaction: reaction.reaction,
                    isFavorite: reaction.isFavorite
                }
                : null,
            userFeedback: userFeedback || null
        };
        return (0, helper_1.safeJson)(response);
    }
    catch (error) {
        console.error("Error fetching branch details:", error);
        throw new Error("Database query failed");
    }
};
exports.getBranchDetailsService = getBranchDetailsService;
const createRecentViewService = async (userId, branchId) => {
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + 5.5 * 60 * 60 * 1000); // Convert to IST (UTC+5:30)
    //Check if the recent view already exists
    const existingView = await prisma.recentView.findFirst({
        where: { userId, branchId }
    });
    if (existingView) {
        // If exists, update the timestamp
        await prisma.recentView.update({
            where: { id: existingView.id },
            data: { viewedAt: nowIST },
        });
    }
    else {
        // 1. Create new recent view
        await prisma.recentView.create({
            data: {
                userId,
                branchId,
                viewedAt: nowIST,
            },
        });
    }
    // 2. Increment views on the branch
    await prisma.branch.update({
        where: { id: branchId },
        data: { views: { increment: 1 } }, // 👈 +1 to views
    });
    // Get all recent views for this user (most recent first)
    const recentViews = await prisma.recentView.findMany({
        where: { userId },
        orderBy: { viewedAt: "desc" }, // Get latest first
    });
    // If there are more than 5 recent views, delete the oldest one
    if (recentViews.length > 5) {
        const oldestView = recentViews[recentViews.length - 1]; // Get the last one
        await prisma.recentView.delete({ where: { id: oldestView.id } });
    }
    return { message: "Recent view added successfully" };
};
exports.createRecentViewService = createRecentViewService;
// 📌 Get Recent Views for a User
const getRecentViewsService = async (userId) => {
    const recentViews = await prisma.recentView.findMany({
        where: { userId },
        include: { branch: true }, // Include branch details
        orderBy: { viewedAt: "desc" }, // Show latest first
        take: 5, // Max 5 recent views
    });
    return (0, helper_1.safeJson)(recentViews);
};
exports.getRecentViewsService = getRecentViewsService;
const getStates = async () => {
    return await prisma.state.findMany();
};
exports.getStates = getStates;
const getCitiesByStateId = async (stateId) => {
    return await prisma.city.findMany({
        where: { stateId },
    });
};
exports.getCitiesByStateId = getCitiesByStateId;
const upsertReaction = async (userId, branchId, reaction, isFavorite) => {
    const existing = await prisma.branchReaction.findUnique({
        where: {
            userId_branchId: {
                userId,
                branchId,
            },
        },
    });
    const updateData = {};
    if (reaction !== undefined)
        updateData.reaction = reaction;
    if (isFavorite !== undefined)
        updateData.isFavorite = isFavorite;
    if (existing) {
        const previousReaction = existing.reaction;
        const updated = await prisma.branchReaction.update({
            where: {
                userId_branchId: {
                    userId,
                    branchId,
                },
            },
            data: updateData,
        });
        if (reaction && previousReaction !== reaction) {
            const updateBranchData = {};
            // Decrement old reaction
            if (previousReaction === 'LIKE')
                updateBranchData.like = { decrement: 1 };
            if (previousReaction === 'DISLIKE')
                updateBranchData.dislike = { decrement: 1 };
            // Increment new reaction
            if (reaction === 'LIKE')
                updateBranchData.like = { increment: 1 };
            if (reaction === 'DISLIKE')
                updateBranchData.dislike = { increment: 1 };
            if (Object.keys(updateBranchData).length) {
                await prisma.branch.update({
                    where: { id: branchId },
                    data: updateBranchData,
                });
            }
        }
        return updated;
    }
    else {
        const created = await prisma.branchReaction.create({
            data: {
                userId,
                branchId,
                reaction: reaction ?? 'NONE',
                isFavorite: isFavorite ?? false,
            },
        });
        // Increment if LIKE or DISLIKE
        if (reaction === 'LIKE' || reaction === 'DISLIKE') {
            await prisma.branch.update({
                where: { id: branchId },
                data: {
                    [reaction.toLowerCase()]: {
                        increment: 1,
                    },
                },
            });
        }
        return created;
    }
};
exports.upsertReaction = upsertReaction;
const getReaction = async (userId, branchId) => {
    return await prisma.branchReaction.findUnique({
        where: {
            userId_branchId: {
                userId,
                branchId
            }
        }
    });
};
exports.getReaction = getReaction;
const createFeedback = async (userId, branchId, message, anonymous) => {
    return await prisma.feedback.create({
        data: {
            userId,
            branchId,
            message,
            anonymous
        }
    });
};
exports.createFeedback = createFeedback;
const getBranchFeedbacks = async (branchId) => {
    return await prisma.feedback.findMany({
        where: { branchId },
        select: {
            id: true,
            message: true,
            anonymous: true,
            createdAt: true,
            healthCardUser: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10 //LIMIt to 10 feedbacks
    });
};
exports.getBranchFeedbacks = getBranchFeedbacks;
const getFavoriteBranchesService = async (userId) => {
    try {
        const favorites = await prisma.branchReaction.findMany({
            where: {
                userId,
                isFavorite: true
            },
            include: {
                branch: true
            }
        });
        return (0, helper_1.safeJson)(favorites);
    }
    catch (error) {
        console.error("Error fetching favorite branches:", error);
        throw new Error("Failed to fetch favorite branches");
    }
};
exports.getFavoriteBranchesService = getFavoriteBranchesService;
