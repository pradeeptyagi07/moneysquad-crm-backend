"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginService = exports.deleteUser = exports.deleteFamilyMemberService = exports.updateUserService = exports.getFamilyService = exports.getUserService = exports.registerUser = void 0;
const argon2_1 = __importDefault(require("argon2"));
const client_1 = __importDefault(require("../../prisma/client"));
const hash_1 = require("../utils/hash");
const helper_1 = require("../utils/helper");
const jwt_1 = require("../utils/jwt");
const upload_service_1 = require("./upload.service");
const otp_service_1 = require("./otp.service");
const registerUser = async (data, files, userId) => {
    const { name, email, phoneNumber, gender, dob, bloodGroup, primaryMember, aimym_member } = data;
    // Step:1 -> Find the user form user login table
    if (phoneNumber) {
        const existingUser = await client_1.default.healthCardUser.findFirst({ where: { phoneNumber } });
        if (existingUser) {
            const error = new Error("Duplicate Phone Number");
            error.status = 409;
            throw error;
        }
    }
    if (!data.email) {
        data.email = null;
    }
    else {
        const existingUserByEmail = await client_1.default.healthCardUser.findFirst({ where: { email: data.email } });
        if (existingUserByEmail) {
            const error = new Error("Duplicate Email");
            error.status = 409;
            throw error;
        }
    }
    const password = name + phoneNumber;
    const hashedPassword = await (0, hash_1.hashPassword)(password);
    let s3url;
    if (files.avatar?.[0]) {
        s3url = await (0, helper_1.uploadFileToS3)(files.avatar?.[0], 'avatars');
    }
    const user = await client_1.default.healthCardUser.create({
        data: {
            name,
            email,
            avatar: s3url,
            phoneNumber: phoneNumber || null,
            dob,
            gender,
            bloodGroup,
            primaryMember: primaryMember === "true",
            aimym_member: aimym_member === "true",
        },
    });
    if (userId) {
        //family member
        await client_1.default.healthCardUser.update({
            where: { id: user.id },
            data: { familyId: userId }
        });
    }
    else {
        //primary user
        await client_1.default.healthCardUser.update({
            where: { id: user.id },
            data: { familyId: user.id }
        });
    }
    const userLogin = await client_1.default.userLogin.findFirst({ where: { phoneNumber } });
    if (!userLogin) {
        //create user Login
        const loginUser = await client_1.default.userLogin.create({
            data: {
                phoneNumber,
                password: hashedPassword,
                healthCardUserId: user.id
            }
        });
    }
    else {
        await client_1.default.userLogin.update({
            where: { id: user.id },
            data: { healthCardUserId: user.id }
        });
    }
    return { user, token: (0, jwt_1.generateToken)(user.id) };
};
exports.registerUser = registerUser;
const getUserService = async (userId) => {
    const user = await client_1.default.healthCardUser.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phoneNumber: true,
            dob: true,
            gender: true,
            bloodGroup: true,
            primaryMember: true,
            aimym_member: true,
            familyId: true,
            cardId: true
        }
    });
    return { user };
};
exports.getUserService = getUserService;
const getFamilyService = async (userId) => {
    const user = await client_1.default.healthCardUser.findUnique({
        where: { id: userId },
        select: { familyId: true }
    });
    const familyMember = await client_1.default.healthCardUser.findMany({
        where: {
            familyId: user?.familyId
        },
        include: { cards: true }
    });
    return familyMember;
};
exports.getFamilyService = getFamilyService;
const updateUserService = async (userId, files, data) => {
    const { name, email, phoneNumber, gender, dob, bloodGroup, aimym_member } = data;
    const updateData = {};
    const existingUser = await client_1.default.healthCardUser.findUnique({
        where: { id: userId },
        select: { avatar: true },
    });
    if (files.avatar?.[0]) {
        if (existingUser?.avatar) {
            // ✅ Delete the old avatar from S3
            await (0, upload_service_1.deleteFileFromS3)(existingUser.avatar);
        }
        updateData.avatar = await (0, helper_1.uploadFileToS3)(files.avatar?.[0], 'avatars');
    }
    if (email) {
        const existingUserByEmail = await client_1.default.healthCardUser.findFirst({
            where: {
                email,
                id: { not: userId }, // Exclude current user
            }
        });
        if (existingUserByEmail) {
            const error = new Error("Duplicate Email");
            error.status = 409;
            throw error;
        }
        updateData.email = data.email;
    }
    if (name)
        updateData.name = name;
    if (phoneNumber)
        updateData.phoneNumber = phoneNumber;
    if (gender)
        updateData.gender = gender;
    if (dob)
        updateData.dob = dob;
    if (bloodGroup)
        updateData.bloodGroup = bloodGroup;
    if (aimym_member !== undefined) {
        updateData.aimym_member = aimym_member === "true";
    }
    console.log("updateData", updateData);
    return await client_1.default.healthCardUser.update({
        where: { id: userId },
        data: updateData,
    });
};
exports.updateUserService = updateUserService;
const deleteFamilyMemberService = async (userId, memberId) => {
    const user = await client_1.default.healthCardUser.delete({
        where: {
            id: memberId,
            familyId: userId
        }
    });
};
exports.deleteFamilyMemberService = deleteFamilyMemberService;
// export const deleteUserByPhoneService = async (phoneNumber: string) => {
//     const user = await prisma.user.findUnique({
//         where: { phoneNumber }
//     });
//     if (!user) return null;
//     return prisma.$transaction(async (prisma) => {
//         // Delete related data first
//         await prisma.card.deleteMany({ where: { userId: user.id } });
//         await prisma.transaction.deleteMany({ where: { userId: user.id } });
//         // Delete the user
//         return prisma.user.delete({ where: { id: user.id } });
//     });
// };
const deleteUser = async (userId) => {
    const user = await client_1.default.healthCardUser.findUnique({
        where: { id: userId }
    });
    if (!user) {
        const error = new Error("user not found");
        error.status = 404;
        throw error;
    }
    return await client_1.default.$transaction(async (tx) => {
        if (user.familyId) {
            await tx.healthCardUser.deleteMany({
                where: {
                    familyId: user.id
                },
            });
        }
        else {
            await tx.healthCardUser.delete({
                where: { id: userId }
            });
        }
    });
};
exports.deleteUser = deleteUser;
const loginService = async (payload) => {
    const { email, password, phoneNumber, otp, isLogin } = payload;
    if (email && password) {
        const healthCardUser = await client_1.default.healthCardUser.findFirst({ where: { email } });
        const user = await client_1.default.userLogin.findUnique({ where: { id: healthCardUser?.id } });
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }
        const isMatch = await argon2_1.default.verify(user.password, password);
        if (!isMatch) {
            const error = new Error("Invalid credentials");
            error.status = 400;
            throw error;
        }
        const token = (0, jwt_1.generateToken)(user.id);
        return { user, token };
    }
    if (phoneNumber && otp) {
        const data = await (0, otp_service_1.verifyOTP)(phoneNumber, isLogin, otp);
        console.log("data", data);
        return data;
    }
};
exports.loginService = loginService;
