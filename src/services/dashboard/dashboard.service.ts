import dayjs from "dayjs";
import DisbursedForm from "../../model/disbursedForm.model";
import { CombinedUser } from "../../model/user/user.model";
import { ICombinedUser } from "../../model/user/interfaces"
import { Timeline } from "../../model/timeline.model";
import mongoose from "mongoose";
import PartnerPayoutModel from "../../model/PartnerPayout.model";
import { LoanType } from "../../model/loan.model";
import { start } from "repl";
import { sendPartnerAgreementEmail } from "../common.service";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import { PartnerDisbursalTarget, IPartnerPayout } from "../../model/PartnerPayout.model"

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

// ==================== TYPES & INTERFACES ====================

interface BaseParams {
    period?: string;
    loanType?: string;
    associateId?: string;
    userId: string;
    managerId?: string;
    partnerId?: string;
}

interface FunnelData extends BaseParams { }
interface SnapshotData extends BaseParams { }
interface TrendsData extends BaseParams {
    trendMonths?: number;
}
interface RejectionReasonCount extends BaseParams { }
interface MatrixData extends BaseParams { }

interface DateRange {
    start: Date;
    end: Date;
}

interface UserContext {
    user: any;
    role: string;
    userId: string;
}

interface QueryFilters {
    baseQuery: any;
    dateRange?: DateRange;
}

// ==================== UTILITY FUNCTIONS ====================

/** Returns an ordered list of YYYY‑MM strings, oldest → newest */
const buildMonthSeries = (months: number): string[] => {
    const series: string[] = [];
    const today = dayjs().startOf("month");
    for (let i = months - 1; i >= 0; i--) {
        series.push(today.subtract(i, "month").format("YYYY-MM"));
    }
    return series;
};

/** Merges aggregation {month,value}[] into a full series */
const fillSeries = (
    series: string[],
    agg: { month: string; value: number }[]
): { month: string; value: number }[] => {
    const map = new Map(agg.map((d) => [d.month, d.value]));
    return series.map((m) => ({ month: m, value: map.get(m) ?? 0 }));
};

/** Calculate percentage with proper handling of edge cases */
const calculatePercentage = (numerator: number, denominator: number): number => {
    if (denominator === 0) return 0;
    return parseFloat(((numerator / denominator) * 100).toFixed(1));
};

/** Calculate delta percentage between current and previous values */
const calculateDeltaPercentage = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(2));
};

/** Parse date range from period string */
const parseDateRange = (period?: string): DateRange | undefined => {
    if (!period) return undefined;
    const start = dayjs(period).startOf("month").toDate();
    const end = dayjs(period).endOf("month").toDate();
    console.log(start)
    console.log(end)
    return {
        start,
        end
    };
};

/** Get current and previous month date ranges */
const getCurrentAndPreviousMonths = (): { current: DateRange; previous: DateRange } => {
    const now = dayjs();
    return {
        current: {
            start: now.startOf("month").toDate(),
            end: now.endOf("month").toDate()
        },
        previous: {
            start: now.subtract(1, "month").startOf("month").toDate(),
            end: now.subtract(1, "month").endOf("month").toDate()
        }
    };
};

// ==================== QUERY BUILDERS ====================

/** Build base query filters based on user role and parameters */
const buildBaseQuery = async (params: BaseParams, userContext: UserContext): Promise<QueryFilters> => {
    const { loanType, associateId, period } = params;
    const { user } = userContext;
    const relatedLeadId = await getRelatedLeadIds(userContext);

    const baseQuery: any = { _id: { $in: relatedLeadId } };

    // Add loan type filter
    if (loanType) {
        if (params.loanType) baseQuery["loan.loan_id"] = params.loanType;

    }

    // Add associate filter
    if (associateId) {
        if (params.associateId) baseQuery["assocaite_Lead_Id"] = params.associateId;
    }
    if (params.partnerId) baseQuery["partner_Lead_Id"] = params.partnerId;
    if (params.managerId) baseQuery["assignedTo"] = params.managerId;
    const dateRange = parseDateRange(period);
    if (dateRange) {
        baseQuery.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
    }

    return { baseQuery, dateRange };
};

/** Get related lead IDs based on user role */
const getRelatedLeadIds = async (userContext: UserContext): Promise<mongoose.Types.ObjectId[]> => {
    const { user } = userContext;

    switch (user.role) {
        case "partner": {
            const [associates, partnerLeads, associateLeads] = await Promise.all([
                CombinedUser.find({ associateOf: user._id, role: "associate" }).select("_id"),
                CombinedUser.find({ partner_Lead_Id: user._id, role: "lead" }).select("_id"),
                CombinedUser.find({
                    assocaite_Id: { $in: (await CombinedUser.find({ associateOf: user._id, role: "associate" })).map(a => a._id) },
                    role: "lead"
                }).select("_id")
            ]);

            return [...partnerLeads, ...associateLeads].map(l => l._id as mongoose.Types.ObjectId);
        }
        case "manager": {
            const leads = await CombinedUser.find({ assignedTo: user._id, role: "lead" }).select("_id");
            return leads.map(l => l._id as mongoose.Types.ObjectId);
        }
        case "associate": {
            const leads = await CombinedUser.find({ assocaite_Lead_Id: user._id, role: "lead" }).select("_id");
            return leads.map(l => l._id as mongoose.Types.ObjectId);
        }
        case "admin": {
            const leads = await CombinedUser.find({ role: "lead" }).select("_id");
            return leads.map(l => l._id as mongoose.Types.ObjectId);
        }
        default:
            return [];
    }
};
const getActiveLead = async (
    params: SnapshotData,
    currentMonthStr: string,
    filter: any
): Promise<{ uniqueCount: number; totalCount: number }> => {
    const activeLeads = await CombinedUser.find({
        status: { $in: ["new lead", "pending", "login", "approved"] },
        ...filter // Merge your custom filter here
    });

    const uniqueSet = new Set<string>();
    activeLeads.forEach((lead) => {
        const key = `${lead.email}-${lead.mobile}`;
        uniqueSet.add(key);
    });

    return {
        uniqueCount: uniqueSet.size,
        totalCount: activeLeads.length,
    };
};





// ==================== CORE SERVICE FUNCTIONS ====================

/** Get user context with validation */
const getUserContext = async (userId: string): Promise<UserContext> => {
    const user = await CombinedUser.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    return { user, role: user.role, userId };
};

/** Get timeline statistics for specific status */
const getTimelineStats = async (
    leadIds: string[],
    status: string,
    dateRange?: DateRange
): Promise<number> => {
    const filter: any = {
        leadId: { $in: leadIds },
        status
    };

    if (dateRange) {
        filter.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
    }

    const timelines = await Timeline.find(filter).select("leadId");
    const uniqueLeadIds = new Set(timelines.map(t => t.leadId.toString()));
    return uniqueLeadIds.size;
};

/** Get disbursal amounts from payouts */
const getDisbursalAmounts = async (
    userContext: UserContext,
    dateRange: DateRange
): Promise<number> => {
    const { user } = userContext;
    const baseFilter: any = {
        actualDisbursedDate: { $gte: dateRange.start, $lte: dateRange.end }
    };

    switch (user.role) {
        case "partner": {
            const associates = await CombinedUser.find({
                associateOf: user._id,
                role: "associate"
            }).select("_id");
            const associateIds = associates.map(a => a._id);

            baseFilter["$or"] = [
                { partner_Id: user._id },
                { partner_Id: { $in: associateIds } }
            ];
            break;
        }
        case "associate":
            baseFilter.partner_Id = user._id;
            break;
        case "manager":
            return 0; // Manager doesn't have access to disbursed amounts
    }

    const result = await PartnerPayoutModel.aggregate([
        { $match: baseFilter },
        {
            $group: {
                _id: null,
                total: { $sum: "$disbursedAmount" }
            }
        }
    ]);

    return result[0]?.total || 0;
};

/** Calculate commission earned for partners */
const calculateCommissionEarned = async (
    userContext: UserContext,
    currentRange: DateRange,
    previousRange: DateRange
): Promise<any> => {
    const { user } = userContext;

    if (user.role !== "partner") return null;

    const payouts = await PartnerPayoutModel.find({ partner_Id: user._id })
        .populate("disbursedId");

    let thisMonthTotal = 0;
    let previousMonthTotal = 0;
    let thisMonthGrossTotal = 0;
    let previousMonthGrossTotal = 0;

    for (const payout of payouts) {
        const disbursedDate = (payout.disbursedId as any)?.actualDisbursedDate;
        if (!disbursedDate) continue;

        const commissionRate = payout.commission ?? 0;
        const gross = (payout.disbursedAmount * commissionRate) / 100;
        const tds = gross * 0.02;
        const net = gross - tds;
        const disbursedTime = new Date(disbursedDate).getTime();

        if (disbursedTime >= currentRange.start.getTime() && disbursedTime <= currentRange.end.getTime()) {
            thisMonthTotal += net;
            thisMonthGrossTotal += gross;
        } else if (disbursedTime >= previousRange.start.getTime() && disbursedTime <= previousRange.end.getTime()) {
            previousMonthTotal += net;
            previousMonthGrossTotal += gross;
        }
    }

    const thisMonthPercent = thisMonthGrossTotal > 0 ? (thisMonthTotal / thisMonthGrossTotal) * 100 : 0;
    const previousMonthPercent = previousMonthGrossTotal > 0 ? (previousMonthTotal / previousMonthGrossTotal) * 100 : 0;
    const deltaCommissionPercent = thisMonthPercent - previousMonthPercent;

    return {
        thisMonth: parseFloat(thisMonthTotal.toFixed(2)),
        previousMonth: parseFloat(previousMonthTotal.toFixed(2)),
        deltaPercent: parseFloat(deltaCommissionPercent.toFixed(2))
    };
};

// ==================== MAIN SERVICE ====================

export const dashboardService = {
    async getFunnel(params: FunnelData) {
        const userContext = await getUserContext(params.userId);
        const { baseQuery, dateRange } = await buildBaseQuery(params, userContext);

        // Fetch leads with optimized query
        const leads = await CombinedUser.find(baseQuery).select("leadId status");
        const leadIds = leads.map((lead) => lead.leadId).filter(Boolean) as string[];

        // Count current statuses
        const countCurrent = (status: string) =>
            leads.filter((lead) => lead.status === status).length;

        // Get timeline counts for all statuses in parallel
        const timelineCounts = await Promise.all([
            getTimelineStats(leadIds, "login", dateRange),
            getTimelineStats(leadIds, "approved", dateRange),
            getTimelineStats(leadIds, "disbursed", dateRange)
        ]);

        const [loginTimelineCount, approvedTimelineCount, disbursedTimelineCount] = timelineCounts;
        const addedCount = leadIds.length;
        const currentAdded = leads.filter((lead) =>
            ["new lead", "pending"].includes(lead.status)
        ).length;

        const stages = [
            {
                name: "Added",
                count: addedCount,
                currentCount: currentAdded,
                conversionPct: 100
            },
            {
                name: "Login",
                count: loginTimelineCount,
                currentCount: countCurrent("login"),
                conversionPct: calculatePercentage(loginTimelineCount, addedCount)
            },
            {
                name: "Approved",
                count: approvedTimelineCount,
                currentCount: countCurrent("approved"),
                conversionPct: calculatePercentage(approvedTimelineCount, addedCount)
            },
            {
                name: "Disbursed",
                count: disbursedTimelineCount,
                currentCount: countCurrent("disbursed"),
                conversionPct: calculatePercentage(disbursedTimelineCount, addedCount)
            }
        ];

        return stages;
    },

    async getSnapshot(params: SnapshotData) {
        const userContext = await getUserContext(params.userId);
        const relatedLeadIds = await getRelatedLeadIds(userContext);

        const selectedPeriod = params.period ?? dayjs().format("YYYY-MM");

        const currentMonthStart = dayjs(`${selectedPeriod}-01`).startOf("month").toDate();
        const prevMonthStart = dayjs(currentMonthStart).subtract(1, "month").startOf("month").toDate();
        const prevMonthEnd = dayjs(currentMonthStart).subtract(1, "day").endOf("day").toDate();
        const currentMonthEnd = dayjs(currentMonthStart).endOf("month").toDate();


        // current Approval logic start-------------------------
        const currentApprovalbaseFilter: any = {
            _id: { $in: relatedLeadIds },
            status: "approved",
        };

        if (params.loanType) currentApprovalbaseFilter["loan.loan_id"] = params.loanType;
        if (params.associateId) currentApprovalbaseFilter["assocaite_Lead_Id"] = params.associateId;
        if (params.partnerId) currentApprovalbaseFilter["partner_Lead_Id"] = params.partnerId;
        if (params.managerId) currentApprovalbaseFilter["assignedTo"] = params.managerId;

        // Get filtered leads
        const filteredLeads = await CombinedUser.find(currentApprovalbaseFilter);

        const leadsThisMonth = filteredLeads.filter((lead) =>
            dayjs(lead.updatedAt).isBetween(currentMonthStart, currentMonthEnd, null, '[]')
        );

        const leadsPrevMonth = filteredLeads.filter((lead) =>
            dayjs(lead.updatedAt).isBetween(prevMonthStart, prevMonthEnd, null, "[]")
        );

        const sumLoanAmount = (leads: any[]) =>
            leads.reduce((sum, lead) => {
                const amount = lead.loan?.amount ?? 0;
                return sum + amount;
            }, 0);

        const totalApprovedLoanThisMonth = sumLoanAmount(leadsThisMonth);
        const totalApprovedLoanPrevMonth = sumLoanAmount(leadsPrevMonth);
        const deltaPercentforApprovalStatus = calculateDeltaPercentage(totalApprovedLoanThisMonth, totalApprovedLoanPrevMonth);
        // current Approval logic ends-------------------------

        // active Leads logic starts-------------------------
        const leadFilter: any = {
            _id: { $in: relatedLeadIds },
        };
        if (params.loanType) leadFilter["loan.loan_id"] = params.loanType;
        if (params.partnerId) leadFilter["partner_Lead_Id"] = params.partnerId;
        if (params.managerId) leadFilter["assignedTo"] = params.managerId;
        if (params.associateId) leadFilter["assocaite_Lead_Id"] = params.associateId;
        const currentMonth = dayjs().format("YYYY-MM");
        const isCurrentMonth = !params.period || params.period === currentMonth;
        const totalActiveLead = await getActiveLead(params, currentMonth, leadFilter);
        // active Leads logic ends---------------------------

        // Total Disbursed logic start ----------------------

        const disbursedFilter: any = {
            _id: { $in: relatedLeadIds }
        };

        if (params.associateId) disbursedFilter.assocaite_Lead_Id = params.associateId;
        if (params.managerId) disbursedFilter.assignedTo = params.managerId;
        if (params.partnerId) disbursedFilter.partner_Lead_Id = params.partnerId;

        const combinedUserForDisbursed = await CombinedUser.find(disbursedFilter);

        const combinedUserDisbursedIds = combinedUserForDisbursed.map(user => user._id);

        const totalDisbursedLeads = await PartnerPayoutModel.find({
            lead_Id: { $in: combinedUserDisbursedIds },
            ...(params.loanType && { 'lender.loan_id': params.loanType }),
        });

        const totalDisbursedThisMonth = totalDisbursedLeads.filter((lead: IPartnerPayout) =>
            dayjs(lead.createdAt).isBetween(currentMonthStart, currentMonthEnd, null, '[]')
        );


        const totalDisbursedleadsPrevMonth = totalDisbursedLeads.filter((lead: IPartnerPayout) =>
            dayjs(lead.createdAt).isBetween(prevMonthStart, prevMonthEnd, null, "[]")
        );
        const totalDisbursedsumLoanAmount = (leads: any[]) =>
            leads.reduce((sum, lead) => {
                const amount = lead?.disbursedAmount ?? 0;
                return sum + amount;
            }, 0);
        const totalDisbursedsumLoanAmountThisMonth = totalDisbursedsumLoanAmount(totalDisbursedThisMonth);
        const totalDisbursedsumLoanAmountPrevMonth = totalDisbursedsumLoanAmount(totalDisbursedleadsPrevMonth);
        const DisbursedDeltaPercentforApprovalStatus = calculateDeltaPercentage(totalDisbursedsumLoanAmountThisMonth, totalDisbursedsumLoanAmountPrevMonth);
        // Total Disbursed logic end ----------------------

        //Rejection rate logic start---------------------
        const totalRejectionLeads: any = {
            _id: { $in: relatedLeadIds },
            status: "rejected"
        };
        if (params.loanType) totalRejectionLeads["loan.loan_id"] = params.loanType;
        if (params.managerId) totalRejectionLeads.assignedTo = params.managerId;
        if (params.partnerId) totalRejectionLeads.partner_Lead_Id = params.partnerId;
        const totalRejectedLeads = await CombinedUser.find(totalRejectionLeads);

        const totalRejectedThisMonth = totalRejectedLeads.filter((lead) =>
            dayjs(lead.updatedAt).isBetween(currentMonthStart, currentMonthEnd, null, '[]')
        );

        const totalRejectedPrevMonth = totalRejectedLeads.filter((lead) =>
            dayjs(lead.updatedAt).isBetween(prevMonthStart, prevMonthEnd, null, "[]")
        );

        const totalLeadsCurrentMonth = await CombinedUser.countDocuments({
        _id: { $in: relatedLeadIds },
        role: "lead",
        status: { $nin: ["New", "Pending"] },
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
        ...totalRejectionLeads
        });


        const leadsCurrentMonth = await CombinedUser.find(
        {
            _id: { $in: relatedLeadIds },
            role: "lead",
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
            ...totalRejectionLeads
        },
        { leadId: 1 } // only return leadId field
        ).lean();

        const leadIds = leadsCurrentMonth.map(l => l.leadId);

        // Step 2: Find in timelines collection where status is pending or closed
        const leadsWithTwoTimelines = await Timeline.aggregate([
        {
            $match: {
            leadId: { $in: leadIds },
            status: { $in: ["pending", "closed"] },
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
            }
        },
        {
            $group: {
            _id: "$leadId",
            statuses: { $addToSet: "$status" }, // unique statuses
            total: { $sum: 1 }
            }
        },
        {
            $match: {
            total: 2,
            statuses: { $all: ["pending", "closed"] } // must contain both
            }
        },
        {
            $count: "totalLeads"
        }
        ]);
        const totalLeadWithstatusthisMonth = totalLeadsCurrentMonth + leadsWithTwoTimelines.length

        // ===== Previous Month =====
        const totalLeadsPrevMonth = await CombinedUser.countDocuments({
        _id: { $in: relatedLeadIds },
        role: "lead",
        status: { $nin: ["New", "Pending"] },
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
        ...totalRejectionLeads
        });

        const leadsPrevMonthList  = await CombinedUser.find(
        {
            _id: { $in: relatedLeadIds },
            role: "lead",
            createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
            ...totalRejectionLeads
        },
        { leadId: 1 }
        ).lean();

        const leadIdsPrev = leadsPrevMonthList.map(l => l.leadId);

        const leadsWithTwoTimelinesPrev = await Timeline.aggregate([
        {
            $match: {
            leadId: { $in: leadIdsPrev },
            status: { $in: ["pending", "closed"] },
            createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd }
            }
        },
        {
            $group: {
            _id: "$leadId",
            statuses: { $addToSet: "$status" },
            total: { $sum: 1 }
            }
        },
        {
            $match: {
            total: 2,
            statuses: { $all: ["pending", "closed"] }
            }
        }
        ]);

        const calculateRejectionRatio = (
            rejectedLeadCount: number,
            totalLeadCount: number
        ): number => {
            if (totalLeadCount === 0) return 0;

            const ratio = rejectedLeadCount / totalLeadCount * 100;
            return parseFloat(ratio.toFixed(2));
        };
        const totalLeadWithStatusPrevMonth =
        totalLeadsPrevMonth + leadsWithTwoTimelinesPrev.length;
        const rejectRationThisMonth = calculateRejectionRatio(totalRejectedThisMonth.length, totalLeadWithstatusthisMonth);
        const rejectRationPrevMonth = calculateRejectionRatio(totalRejectedPrevMonth.length , totalLeadWithStatusPrevMonth);
        const rejectionRationDeltaPercent = rejectRationThisMonth - rejectRationPrevMonth;

        
        //Rejection rate logic end---------------------

        //lead added logic start------------------------
        const leadAddedFilter: any = {
            _id: { $in: relatedLeadIds },
            role: "lead"
        };

        if (params.loanType) leadAddedFilter["loan.loan_id"] = params.loanType;
        if (params.associateId) leadAddedFilter["assocaite_Lead_Id"] = params.associateId;
        if (params.managerId) leadAddedFilter.assignedTo = params.managerId;
        if (params.partnerId) leadAddedFilter.partner_Lead_Id = params.partnerId;
        const activeLeadThisMonth = await CombinedUser.find({
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
            ...leadAddedFilter
        });

        const uniqueSetThisMonth = new Set<string>();
        activeLeadThisMonth.forEach((lead: ICombinedUser) => {
            const key = `${lead.email}-${lead.mobile}`;
            uniqueSetThisMonth.add(key);
        });
        //lead added logic end------------------------
        //commision earned logic start----------------
        const commisionearnedFilter: any = {
            _id: { $in: relatedLeadIds }
        };
        if (params.associateId) commisionearnedFilter["assocaite_Lead_Id"] = params.associateId
        if (params.managerId) commisionearnedFilter.assignedTo = params.managerId;
        if (params.partnerId) commisionearnedFilter.partner_Lead_Id = params.partnerId;
        const combinedUserForCommission = await CombinedUser.find({
            ...commisionearnedFilter
        });

        const combinedUserIds = combinedUserForCommission.map(user => user._id);

        const currentMonthPayouts = await PartnerPayoutModel.find({
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
            lead_Id: { $in: combinedUserIds },
            ...(params.loanType && { 'lender.loan_id': params.loanType }),
        });

        // Previous month payouts
        const prevMonthPayouts = await PartnerPayoutModel.find({
            lead_Id: { $in: combinedUserIds },
            createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
            ...(params.loanType && { 'lender.loan_id': params.loanType }),
        });

        // Helper to calculate total commission
        const calculateCommission = (payouts: any[]) => {
            let grossTotal = 0;
            let tdsTotal = 0;
            let netTotal = 0;

            payouts.forEach(payout => {
                const commission = payout.commission ?? 0;
                const disbursed = payout.disbursedAmount ?? 0;
                const gross = (disbursed * commission) / 100;
                const tds = gross * 0.02;
                const net = gross - tds;

                grossTotal += gross;
                tdsTotal += tds;
                netTotal += net;
            });

            return { grossTotal, tdsTotal, netTotal };
        };

        const currentMonthCommission = calculateCommission(currentMonthPayouts);
        const prevMonthCommission = calculateCommission(prevMonthPayouts);
        const deltaPercentCommision = calculateDeltaPercentage(currentMonthCommission.netTotal, prevMonthCommission.netTotal)



        return {
            commissionEarned: {
                current_month_amount: currentMonthCommission.netTotal,
                previous_month_amount: prevMonthCommission.netTotal,
                delta_percentage: deltaPercentCommision
            },
            leadAdded: {
                leads_added: activeLeadThisMonth.length,
                unique_lead: uniqueSetThisMonth.size
            },
            rejectionRation: {
                rejection_ratio_this_month: rejectRationThisMonth,
                rejection_ratio_prev_month: rejectRationPrevMonth,
                delta_percentage: rejectionRationDeltaPercent
            },
            totalDisbursal: {
                current_month_amount: totalDisbursedsumLoanAmountThisMonth,
                previous_month_amount: totalDisbursedsumLoanAmountPrevMonth,
                delta_percentage: DisbursedDeltaPercentforApprovalStatus
            },
            approvalStatus: {
                current_month_amount: totalApprovedLoanThisMonth,
                previous_month_amount: totalApprovedLoanPrevMonth,
                delta_percentage: deltaPercentforApprovalStatus
            },
            ...(isCurrentMonth && {
                activeLeads: {
                    totalActiveLeads: totalActiveLead.totalCount,
                    uniqueCount: totalActiveLead.uniqueCount
                }
            })
        }
    },

    async getRejectionReasonCount(params: RejectionReasonCount) {
        const userContext = await getUserContext(params.userId);
        const { baseQuery, dateRange } = await buildBaseQuery(params, userContext);
        
        const leads = await CombinedUser.find(baseQuery).select("leadId status");
        const leadIds = leads.map((lead) => lead.leadId).filter(Boolean);

        const aggregateQuery: any = [
            {
                $match: {
                    leadId: { $in: leadIds },
                    status: "rejected",
                    rejectReason: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$rejectReason",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 7
            }
        ];

        if (dateRange) {
            aggregateQuery[0].$match.createdAt = { $gte: dateRange.start, $lte: dateRange.end };
        }

        const aggregate = await Timeline.aggregate(aggregateQuery);
        const total = aggregate.reduce((sum, item) => sum + item.count, 0);

        const rejectionReasonCount = aggregate.map((item) => ({
            reason: item._id,
            count: item.count,
            percent: calculatePercentage(item.count, total)
        }));

        return {
            rejectionReasonCount,
            totalCount: total
        };
    },

    async getTrends(params: TrendsData) {
        const userContext = await getUserContext(params.userId);
        const relatedLeadIds = await getRelatedLeadIds(userContext);
        const numberOfMonths = Number(params.trendMonths) || 1;

        const baseMonth = dayjs(); // current month

        const results: any[] = [];

        for (let i = numberOfMonths - 1; i >= 0; i--) {
            const monthDate = baseMonth.subtract(i, "month");
            const currentMonthStart = monthDate.startOf("month").toDate();
            const currentMonthEnd = monthDate.endOf("month").toDate();

            const leadAddedFilter: any = {
                _id: { $in: relatedLeadIds },
                role: "lead",
            };
            if (params.managerId) leadAddedFilter.assignedTo = params.managerId;
            if (params.partnerId) leadAddedFilter.partner_Lead_Id = params.partnerId;
            if (params.associateId) leadAddedFilter["assocaite_Lead_Id"] = params.associateId;
            const activeLeads = await CombinedUser.find({
                createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
                ...leadAddedFilter,
            });
            const combinedUser = activeLeads.map(user => user._id);
            const totalDisbursedLeads = await PartnerPayoutModel.find({
                createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
                lead_Id: { $in: combinedUser },
                ...(params.loanType && { 'lender.loan_id': params.loanType }),
            });
            function sumDisbursedAmount(leads: { disbursedAmount?: number }[]): number {
                return leads.reduce((sum, lead) => sum + (lead.disbursedAmount ?? 0), 0);
            }

            const totalDisbursedsumLoanAmount = sumDisbursedAmount(totalDisbursedLeads);

            results.push({
                month: monthDate.format("YYYY-MM"),
                activeLead: activeLeads.length,
                totalDisbursed: totalDisbursedLeads.length,
                totalDisbursedsumLoanAmounts: totalDisbursedsumLoanAmount,
            });
        }

        return results;
    },

    async getMatrix(params: MatrixData) {
        const userContext = await getUserContext(params.userId);
        const relatedLeadIds = await getRelatedLeadIds(userContext);
        const selectedPeriod = params.period ?? dayjs().format("YYYY-MM");

        const currentMonthStart = dayjs(`${selectedPeriod}-01`).startOf("month").toDate();
        const prevMonthStart = dayjs(currentMonthStart).subtract(1, "month").startOf("month").toDate();
        const prevMonthEnd = dayjs(currentMonthStart).subtract(1, "day").endOf("day").toDate();
        const currentMonthEnd = dayjs(currentMonthStart).endOf("month").toDate();

        const totalDisbursedFilter: any = {
            _id: { $in: relatedLeadIds },
        };

        if (params.associateId) totalDisbursedFilter.assocaite_Lead_Id = params.associateId;
        if (params.managerId) totalDisbursedFilter.assignedTo = params.managerId;
        if (params.partnerId) totalDisbursedFilter.partner_Lead_Id = params.partnerId;

        const combinedUserForDisbursed = await CombinedUser.find(totalDisbursedFilter);

        const combinedUserDisbursedIds = combinedUserForDisbursed.map(user => user._id);

        const totalDisbursedLeads = await PartnerPayoutModel.find({
            lead_Id: { $in: combinedUserDisbursedIds },
            ...(params.loanType && { 'lender.loan_id': params.loanType })
        });

        const totalDisbursedThisMonth = totalDisbursedLeads.filter((lead: IPartnerPayout) =>
            dayjs(lead.createdAt).isBetween(currentMonthStart, currentMonthEnd, null, '[]')
        );


        const totalDisbursedleadsPrevMonth = totalDisbursedLeads.filter((lead: IPartnerPayout) =>
            dayjs(lead.createdAt).isBetween(prevMonthStart, prevMonthEnd, null, "[]")
        );

        // --------------------
        const totalLeadsIn: any = {
            status: { $in: ["new lead", "pending"] },
            _id: { $in: relatedLeadIds }
        };
        if (params.loanType) totalLeadsIn["loan.loan_id"] = params.loanType;
        if (params.associateId) totalLeadsIn["assocaite_Lead_Id"] = params.associateId;
        if (params.managerId) totalLeadsIn.assignedTo = params.managerId;
        if (params.partnerId) totalLeadsIn.partner_Lead_Id = params.partnerId;
        const totalLeads = await CombinedUser.find(totalLeadsIn);

        const totalLeadsThisMonth = totalLeads.filter((lead) =>
            dayjs(lead.updatedAt).isBetween(currentMonthStart, currentMonthEnd, null, '[]')
        );

        const totalLeadsPrevMonth = totalLeads.filter((lead) =>
            dayjs(lead.updatedAt).isBetween(prevMonthStart, prevMonthEnd, null, "[]")
        );

        const timelines = await Timeline.find({
            status: { $in: ["pending", "closed"] },
            createdAt: { $gte: prevMonthStart, $lte: currentMonthEnd },
        }).sort({ leadId: 1, createdAt: 1 });

        const leadMap = new Map();

        timelines.forEach((entry) => {
            const { leadId, status, createdAt } = entry;
            if (!leadMap.has(leadId)) {
                leadMap.set(leadId, []);
            }
            leadMap.get(leadId).push({ status, createdAt });
        });

        let prevMonthCount = 0;
        let currentMonthCount = 0;

        for (const [leadId, statusLogs] of leadMap.entries()) {
            let pendingCount = 0;
            let closedCount = 0;
            let firstPendingDate = null;
            let firstClosedDate = null;

            for (const { status, createdAt } of statusLogs) {
                if (status === "pending") {
                    pendingCount++;
                    if (!firstPendingDate) firstPendingDate = createdAt;
                }
                if (status === "closed") {
                    closedCount++;
                    if (!firstClosedDate) firstClosedDate = createdAt;
                }
            }

            // Only consider leads with exactly one pending and one closed,
            // and where pending comes before closed
            if (pendingCount === 1 && closedCount === 1 && firstPendingDate < firstClosedDate) {
                if (firstClosedDate >= currentMonthStart && firstClosedDate <= currentMonthEnd) {
                    currentMonthCount++;
                } else if (firstClosedDate >= prevMonthStart && firstClosedDate <= prevMonthEnd) {
                    prevMonthCount++;
                }
            }
        }
        const currentMonthDisbursedRaw = (totalDisbursedThisMonth.length / totalLeadsThisMonth.length) * 100;
        const currentMonthDisbursed = !isFinite(currentMonthDisbursedRaw) ? 0 : currentMonthDisbursedRaw;

        const previusMonthDisbursed = (totalDisbursedleadsPrevMonth.length / totalLeadsPrevMonth.length) * 100;
        const deltaDisbursed = (currentMonthDisbursed - previusMonthDisbursed)  ;

        // tat
        const calculateAvgPayoutDelay = async (payouts: IPartnerPayout[]): Promise<number> => {
            let totalDays = 0;
            let count = 0;

            for (const payout of payouts) {
                const timeline = await Timeline.findOne({ leadId: payout.leadId, status: "login" }).sort({ createdAt: 1 });

                if (timeline && payout.createdAt) {
                    const payoutDate = dayjs(payout.createdAt);
                    const timelineDate = dayjs(timeline.createdAt);
                    const diffDays = payoutDate.diff(timelineDate, 'day');

                    totalDays += diffDays;
                    count++;
                }
            }

            return count > 0 ? (totalDays / count) + 1 : 0;
        };

        const avgdisbursedthisMonth = await calculateAvgPayoutDelay(totalDisbursedThisMonth);
        const avgdisbursedPrevMonth = await calculateAvgPayoutDelay(totalDisbursedleadsPrevMonth);
        const deltapercentage = calculateDeltaPercentage(avgdisbursedthisMonth, avgdisbursedPrevMonth);
        // -------------
         const totalDisbursedsFilter: any = {
            lead_Id: { $in: relatedLeadIds },
        };

        if (params.loanType) totalDisbursedsFilter["lender.loan_id"] = params.loanType;
        if (params.associateId) totalDisbursedsFilter["partner_Id"] = params.associateId;

        const totalDisbursedsLeads = await PartnerPayoutModel.find(totalDisbursedsFilter);
        // --- CURRENT MONTH ---
        const totalDisbursedsThisMonth = totalDisbursedsLeads.filter((lead: IPartnerPayout) =>
            dayjs(lead.createdAt).isBetween(currentMonthStart, currentMonthEnd, null, '[]')
        );
        const totalLeads_ThisMonth = totalDisbursedsThisMonth.length;

        const totalDisbursedAmountThisMonth = sumDisbursedAmount(totalDisbursedsThisMonth);

        const avgDisbursedAmountThisMonth =
            totalLeads_ThisMonth > 0 ? totalDisbursedAmountThisMonth / totalLeads_ThisMonth : 0;

        // --- PREVIOUS MONTH ---
        const totalDisbursedsPrevMonth = totalDisbursedsLeads.filter((lead: IPartnerPayout) =>
            dayjs(lead.createdAt).isBetween(prevMonthStart, prevMonthEnd, null, '[]')
        );

        const totalLeadsPrev_Month = totalDisbursedsPrevMonth.length;

        const totalDisbursedAmountPrevMonth = sumDisbursedAmount(totalDisbursedsPrevMonth);

        const avgDisbursedAmountPrevMonth =
            totalLeadsPrev_Month > 0 ? totalDisbursedAmountPrevMonth / totalLeadsPrev_Month : 0;

        const deltaPercentage = calculateDeltaPercentage(avgDisbursedAmountThisMonth, avgDisbursedAmountPrevMonth)

        //-------------
        const baseFilter: any = {
            _id: { $in: relatedLeadIds },
        };
        if (params.associateId) baseFilter.assocaite_Lead_Id = params.associateId;
        if (params.managerId) baseFilter.assignedTo = params.managerId;
        if (params.partnerId) baseFilter.partner_Lead_Id = params.partnerId;

        const combinedUser = await CombinedUser.find(baseFilter);

        const combinedUserIds = combinedUser.map(user => user._id);

        const currentMonthFilter = {
            lead_Id: { $in: combinedUserIds },
            ...(params.loanType && { 'lender.loan_id': params.loanType }),
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
        };

        const prevMonthFilter = {
            lead_Id: { $in: combinedUserIds },
            ...(params.loanType && { 'lender.loan_id': params.loanType }),
            createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
        };
        const currentMonthLeads = await PartnerPayoutModel.find(currentMonthFilter);
        const prevMonthLeads = await PartnerPayoutModel.find(prevMonthFilter);

        function sumDisbursedAmount(leads: { disbursedAmount?: number }[]): number {
            return leads.reduce((sum, lead) => sum + (lead.disbursedAmount ?? 0), 0);
        }
        const sumDisbursedCurrent = sumDisbursedAmount(currentMonthLeads);
        const sumDisbursedPrev = sumDisbursedAmount(prevMonthLeads);

        
        const currentUser = await CombinedUser.findById(userContext.userId).lean();

        let disbursalTarget: PartnerDisbursalTarget;

        const plan = currentUser?.commissionPlan?.toLowerCase();

        if (plan === "diamond") {
            disbursalTarget = PartnerDisbursalTarget.diamond;
        } else if (plan === "gold") {
            disbursalTarget = PartnerDisbursalTarget.gold;
        } else if (plan === "platinum") {
            disbursalTarget = PartnerDisbursalTarget.platinum;
        } else if (!plan || plan === "n/a") {
            disbursalTarget = PartnerDisbursalTarget.DEFAULT;
        } else {
            disbursalTarget = PartnerDisbursalTarget.leadSharing;
        }
        const thisavgMonth = sumDisbursedCurrent / disbursalTarget;
        const prevavgMonth = sumDisbursedPrev / disbursalTarget
        const targetPercentage = calculateDeltaPercentage(thisavgMonth, prevavgMonth)


        return {
            disbursalRate: {
                current_month_amount: currentMonthDisbursed,
                previous_month_amount: previusMonthDisbursed,
                delta_percentage: deltaDisbursed
            },
            avgTATDays: {
                 current_month_amount: avgdisbursedthisMonth,
                previous_month_amount: avgdisbursedthisMonth,
                delta_percentage: deltapercentage,
            },
            avgLoanAmount: {
                current_month_amount: avgDisbursedAmountThisMonth,
                previous_month_amount: avgDisbursedAmountPrevMonth,
                delta_percentage: deltaPercentage,
            },
            targetAchieved: {
                current_month_amount: thisavgMonth *100,
                previous_month_amount: prevavgMonth*100,
                delta_percentage: targetPercentage,
            }
        }
    },

    updateAgreementAcceptedStatus: async (userId: string, userIP: string) => {
        const user = await CombinedUser.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.role !== 'partner') {
            throw new Error('User is not a partner');
        }

        user.agreementAccepted = true;
        user.agreementAcceptedLogs = [{
            timestamp: new Date(),
            ip: userIP
        }];
        await user.save();
        await sendPartnerAgreementEmail(user.email, user.basicInfo.fullName);
    }
};