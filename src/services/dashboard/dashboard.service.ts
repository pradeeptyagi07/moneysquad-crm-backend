import dayjs from "dayjs";
import DisbursedForm from "../../model/disbursedForm.model";
import { CombinedUser } from "../../model/user/user.model";
import { Timeline } from "../../model/timeline.model";
import mongoose from "mongoose";
import PartnerPayoutModel from "../../model/PartnerPayout.model";
import { LoanType } from "../../model/loan.model";
import { start } from "repl";
import { sendPartnerAgreementEmail } from "../common.service";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

// ==================== TYPES & INTERFACES ====================

interface BaseParams {
    period?: string;
    loanType?: string;
    associateId?: string;
    userId: string;
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

    const baseQuery: any = { role: "lead" };

    // Add loan type filter
    if (loanType) {
        const loanName = await LoanType.findOne({ _id: loanType });
        if (loanName) {
            baseQuery["loan.type"] = loanName.name;
        }
    }

    // Add associate filter
    if (associateId) {
        baseQuery["assocaite_Lead_Id"] = associateId;
    }

    // Add role-based filters
    switch (user.role) {
        case "manager":
            baseQuery.assignedTo = user._id;
            break;
        case "partner":
            baseQuery.partner_Lead_Id = user._id;
            break;
        case "associate":
            baseQuery.assocaite_Lead_Id = user._id;
            break;
    }

    // Add date range filter
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
        default:
            return [];
    }
};
        const getActiveLead = async (
                params: SnapshotData,
                currentMonthStr: string,
                filter: any // Accept your custom filter
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
        const currentMonth = dayjs().format("YYYY-MM");
        const isCurrentMonth = !params.period || params.period === currentMonth;
        const totalActiveLead = await getActiveLead(params,currentMonth,leadFilter);
        // active Leads logic ends---------------------------

        // Total Disbursed logic start ----------------------
        const totalDisbursedFilter: any = {
            lead_Id: { $in: relatedLeadIds },
        };

        if (params.loanType) totalDisbursedFilter["lender.loan_id"] = params.loanType;
        if(params.associateId) totalDisbursedFilter["partner_Id"] = params.associateId

        const totalDisbursedLeads = await PartnerPayoutModel.find(totalDisbursedFilter);

        const totalDisbursedThisMonth = totalDisbursedLeads.filter((lead) =>
        dayjs(lead.createdAt).isBetween(currentMonthStart, currentMonthEnd, null, '[]')
    );


        const totalDisbursedleadsPrevMonth = totalDisbursedLeads.filter((lead) =>
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
            status : "rejected"
        };
        if (params.loanType) totalRejectionLeads["loan.loan_id"] = params.loanType;

        const totalRejectedLeads = await CombinedUser.find(totalRejectionLeads);

        const totalRejectedThisMonth = totalRejectedLeads.filter((lead) =>
            dayjs(lead.updatedAt).isBetween(currentMonthStart, currentMonthEnd, null, '[]')
        );

        const totalRejectedPrevMonth = totalRejectedLeads.filter((lead) =>
            dayjs(lead.updatedAt).isBetween(prevMonthStart, prevMonthEnd, null, "[]")
        );

        const totalLeadsIn: any = {
        status: { $in: ["New", "Pending"] }
        };

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
        const calculateRejectionRatio = (
            rejectedLeadCount: number,
            totalLeadCount: number
            ): number => {
            if (totalLeadCount === 0) return 0;

            const ratio = rejectedLeadCount / totalLeadCount * 100;
            return parseFloat(ratio.toFixed(2)); 
            };
            const totalthismonth = currentMonthCount + totalLeadsThisMonth.length
            const totalPrevmonth = prevMonthCount + totalLeadsPrevMonth.length
            const rejectRationThisMonth = calculateRejectionRatio(totalRejectedThisMonth.length,totalthismonth );  
            const rejectRationPrevMonth = calculateRejectionRatio(totalRejectedPrevMonth.length,totalPrevmonth ); 
            const rejectionRationDeltaPercent = rejectRationThisMonth - rejectRationPrevMonth;  
            //Rejection rate logic end---------------------

            //lead added logic start------------------------
            const leadAddedFilter: any = {
                _id: { $in: relatedLeadIds },
                role : "lead"
            };

            if (params.loanType) leadAddedFilter["loan.loan_id"] = params.loanType;
            if (params.associateId) leadAddedFilter["assocaite_Lead_Id"] = params.associateId;

            const activeLeadThisMonth = await CombinedUser.find({
                    createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
                    ...leadAddedFilter
                    });

            const uniqueSetThisMonth = new Set<string>();
                    activeLeadThisMonth.forEach((lead) => {
                        const key = `${lead.email}-${lead.mobile}`;
                        uniqueSetThisMonth.add(key);
                    });       
         //lead added logic end------------------------
         //commision earned logic start----------------
         const commisionearnedFilter: any = {
            lead_Id: { $in: relatedLeadIds }
        };
        if (params.loanType) commisionearnedFilter["lender.loan_id"] = params.loanType;
        if (params.associateId) commisionearnedFilter["partner_Id"] = params.associateId

        const currentMonthPayouts = await PartnerPayoutModel.find({
            ...commisionearnedFilter,
            createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
        });

        // Previous month payouts
        const prevMonthPayouts = await PartnerPayoutModel.find({
            ...commisionearnedFilter,
            createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
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
        const deltaPercentCommision = calculateDeltaPercentage(currentMonthCommission.netTotal , prevMonthCommission.netTotal )



        return{
            commissionEarned :{
                current_month_amount: currentMonthCommission.netTotal,
                previous_month_amount: prevMonthCommission.netTotal,
                delta_percentage :deltaPercentCommision
            },
            leadAdded : {
                leads_added : activeLeadThisMonth.length,
                unique_lead : uniqueSetThisMonth.size
            },
            rejectionRation: {
                rejection_ratio_this_month : rejectRationThisMonth,
                rejection_ratio_prev_month : rejectRationPrevMonth,
                delta_percentage : rejectionRationDeltaPercent
            },
            totalDisbursal: {
                current_month_amount: totalDisbursedsumLoanAmountThisMonth,
                previous_month_amount: totalDisbursedsumLoanAmountPrevMonth,
                delta_percentage :DisbursedDeltaPercentforApprovalStatus
            },
            approvalStatus: {
                current_month_amount: totalApprovedLoanThisMonth,
                previous_month_amount: totalApprovedLoanPrevMonth,
                delta_percentage :deltaPercentforApprovalStatus
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
         const selectedPeriod = params.period ?? dayjs().format("YYYY-MM");

        const currentMonthStart = dayjs(`${selectedPeriod}-01`).startOf("month").toDate();
        
        const leadAddedFilter: any = {
                _id: { $in: relatedLeadIds },
                role : "lead"
            };
            const activeLead = await CombinedUser.find({
                    createdAt: { $gte: currentMonthStart, },
                    ...leadAddedFilter
                    });
        
        const totalDisbursedFilter: any = {
            lead_Id: { $in: relatedLeadIds },
        };

        const totalDisbursedLeads = await PartnerPayoutModel.find(totalDisbursedFilter);

        const totalDisbursed = totalDisbursedLeads.filter((lead) =>
        dayjs(lead.createdAt).isSameOrAfter(currentMonthStart));  
        
        const totalDisbursedsumLoanAmount = (leads: any[]) =>
            leads.reduce((sum, lead) => {
                const amount = lead?.disbursedAmount ?? 0;
                return sum + amount;
            }, 0);
        const totalDisbursedsumLoanAmounts = totalDisbursedsumLoanAmount(totalDisbursed);
        
        return { activeLead: activeLead.length, totalDisbursed: totalDisbursed.length, totalDisbursedsumLoanAmounts };

    },

    async getMatrix(params: MatrixData) {
        const userContext = await getUserContext(params.userId);
        const { user } = userContext;

        const baseQuery: any = { role: "lead" };

        // Add role-based filters
        switch (user.role) {
            case "manager":
                baseQuery.assignedTo = user._id;
                break;
            case "partner":
                baseQuery.partner_Lead_Id = user._id;
                break;
            case "associate":
                baseQuery.assocaite_Lead_Id = user._id;
                break;
        }

        // Get date range
        const start = params.period
            ? dayjs(params.period).startOf("month").toDate()
            : dayjs().startOf("month").toDate();
        const end = params.period
            ? dayjs(params.period).endOf("month").toDate()
            : dayjs().endOf("month").toDate();

        // Get leads and disbursals in parallel
        const [leads, disbursals] = await Promise.all([
            CombinedUser.find(baseQuery).select("leadId status"),
            DisbursedForm.find({
                leadUserId: { $in: (await CombinedUser.find(baseQuery).select("_id")).map(l => l._id) },
                actualDisbursedDate: { $gte: start, $lte: end }
            })
                .populate({
                    path: 'leadUserId',
                    model: 'CombinedUser',
                    select: 'leadId'
                })
                .select("loanAmount actualDisbursedDate leadUserId")
                .lean()
        ]);

        const leadIds = leads.map((lead) => lead._id).filter(Boolean);
        const disbursedLeadsCount = disbursals.length;
        const totalLeadsCount = leads.length;

        // Calculate disbursal rate
        const disbursalRatePct = calculatePercentage(disbursedLeadsCount, totalLeadsCount);

        // Normalize disbursals with leadId
        const disbursalsNorm = disbursals.map(d => {
            const leadId = d.leadId ||
                (typeof d.leadUserId === "object" && "leadId" in d.leadUserId
                    ? d.leadUserId.leadId
                    : d.leadUserId?.toString?.());
            return { ...d, leadId };
        });

        // Get login timelines for TAT calculation
        const leadIdsStr = disbursalsNorm.map(d => d.leadId).filter(Boolean);
        const timelines = await Timeline.find({
            leadId: { $in: leadIdsStr },
            status: "login"
        }).sort({ createdAt: 1 }).select("leadId createdAt");

        // Map earliest login per lead
        const loginDateMap = new Map<string, Date>();
        for (const t of timelines) {
            if (!loginDateMap.has(t.leadId)) {
                loginDateMap.set(t.leadId, t.createdAt);
            }
        }

        // Calculate TAT for each disbursal
        const tatList: number[] = disbursalsNorm
            .map(d => {
                const leadIdStr = typeof d.leadId === "string" ? d.leadId : String(d.leadId);
                const loginDate = loginDateMap.get(leadIdStr);
                if (!loginDate) return null;

                return dayjs(d.actualDisbursedDate)
                    .startOf('day')
                    .diff(dayjs(loginDate).startOf('day'), 'day');
            })
            .filter((tat): tat is number => tat !== null);

        // Calculate average TAT
        const avgDisbursalTATdays = tatList.length > 0
            ? parseFloat((tatList.reduce((a, b) => a + b, 0) / tatList.length).toFixed(1))
            : 0;

        // Calculate average loan amount
        const totalDisbursedAmount = disbursals.reduce((sum, d) => sum + (d.loanAmount || 0), 0);
        const avgLoanAmount = disbursals.length > 0
            ? Math.round(totalDisbursedAmount / disbursals.length)
            : 0;

        return {
            disbursalRatePct,
            avgDisbursalTATdays,
            avgLoanAmount,
            targetAchievedPct: null
        };
    },

    updateAgreementAcceptedStatus: async(userId: string, userIP: string) =>{
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