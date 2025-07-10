import dayjs from "dayjs";
import DisbursedForm from "../../model/disbursedForm.model";
import { CombinedUser } from "../../model/user/user.model";
import { Timeline } from "../../model/timeline.model";
import mongoose from "mongoose";
import PartnerPayoutModel from "../../model/PartnerPayout.model";

interface FunnelData {
    period?: string;
    loanType?: string;
    associateId?: string;
    userId?: string;
}

interface SnapshotData {
    period?: string;
    loanType?: string;
    associateId?: string;
    userId?: string;
}

interface TrendsData {
    period?: string;
    loanType?: string;
    associateId?: string;
    userId?: string;
}

interface RejectionReasonCount {
    period?: string;
    loanType?: string;
    associateId?: string;
    userId?: string;
}

interface MatrixData {
    period?: string;
    loanType?: string;
    associateId?: string;
    userId?: string;
}

export const dashboardService = {

    async getFunnel(params: FunnelData) {
        const { period, loanType, associateId, userId } = params;

        const user = await CombinedUser.findById(userId);
        if (!user) throw new Error("User not found");

        console.log("id", user._id)

        const baseQuery: any = { role: "lead" };

        // Filter by loanType and associateId if given
        if (loanType) baseQuery["loan.type"] = loanType;
        if (associateId) baseQuery["assocaite_Lead_Id"] = associateId;

        // Filter by role relationships
        if (user.role === "manager") {
            baseQuery.assignedTo = user._id;
        } else if (user.role === "partner") {
            baseQuery.partner_Lead_Id = user._id;
        } else if (user.role === "associate") {
            baseQuery.assocaite_Lead_Id = user._id;
        }

        // Filter by date (month) if `period` given
        let start: Date | undefined, end: Date | undefined;
        if (period) {
            start = dayjs(period).startOf("month").toDate();
            end = dayjs(period).endOf("month").toDate();
            baseQuery.createdAt = { $gte: start, $lte: end };
        }

        console.log(baseQuery);

        // ✅ Fetch all relevant lead docs once
        const leads = await CombinedUser.find(baseQuery).select("leadId status");

        console.log(leads);
        const leadIds = leads.map((lead) => lead.leadId).filter(Boolean);

        // Helper to count in timeline
        const countTimeline = async (status: string) => {
            const timelineFilter: any = {
                status,
                leadId: { $in: leadIds }
            };
            if (period) timelineFilter.createdAt = { $gte: start, $lte: end };
            return Timeline.countDocuments(timelineFilter);
        };

        const countCurrent = (status: string) =>
            leads.filter((lead) => lead.status === status).length;

        // 🧮 Funnel Counts
        const addedCount = leadIds.length;
        const currentAdded = leads.filter((lead) =>
            ["new lead", "pending"].includes(lead.status)
        ).length;

        const loginTimelineCount = await countTimeline("login");
        const currentLogin = countCurrent("login");

        const approvedTimelineCount = await countTimeline("approved");
        const currentApproved = countCurrent("approved");

        const disbursedTimelineCount = await countTimeline("disbursed");
        const currentDisbursed = countCurrent("disbursed");

        // 📊 Final Funnel Response
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
                currentCount: currentLogin,
                conversionPct: addedCount > 0 ? (loginTimelineCount / addedCount) * 100 : 0
            },
            {
                name: "Approved",
                count: approvedTimelineCount,
                currentCount: currentApproved,
                conversionPct: loginTimelineCount > 0 ? (approvedTimelineCount / addedCount) * 100 : 0
            },
            {
                name: "Disbursed",
                count: disbursedTimelineCount,
                currentCount: currentDisbursed,
                conversionPct: approvedTimelineCount > 0
                    ? (disbursedTimelineCount / addedCount) * 100
                    : 0
            }
        ];

        return stages.map((stage) => ({
            ...stage,
            conversionPct: parseFloat(stage.conversionPct.toFixed(1))
        }));
    },

    async getSnapshot(params: SnapshotData) {
        const { period, loanType, associateId, userId } = params;

        const user = await CombinedUser.findById(userId);
        if (!user) throw new Error("User not found");

        const baseQuery: any = { role: "lead" };

        // Filter by loanType and associateId if given
        if (loanType) baseQuery["loan.type"] = loanType;
        if (associateId) baseQuery["assocaite_Lead_Id"] = associateId;

        // Filter by role relationships
        if (user.role === "manager") {
            baseQuery.assignedTo = user._id;
        } else if (user.role === "partner") {
            baseQuery.partner_Lead_Id = user._id;
        } else if (user.role === "associate") {
            baseQuery.assocaite_Lead_Id = user._id;
        }

        // Filter by date (month) if `period` given
        let start: Date | undefined, end: Date | undefined;
        if (period) {
            start = dayjs(period).startOf("month").toDate();
            end = dayjs(period).endOf("month").toDate();
            baseQuery.createdAt = { $gte: start, $lte: end };
        }


        const now = dayjs();
        const currentStart = now.startOf("month").toDate();
        const currentEnd = now.endOf("month").toDate();
        const previousStart = now.subtract(1, "month").startOf("month").toDate();
        const previousEnd = now.subtract(1, "month").endOf("month").toDate();

        // 🔹 Prepare PartnerPayout query for current and previous disbursals
        const getTotalDisbursedFromPayouts = async (start: Date, end: Date): Promise<number> => {
            const baseFilter: any = {
                createdAt: { $gte: start, $lte: end }
            };

            if (user.role === "partner") {
                const associates = await CombinedUser.find({
                    associateOf: user._id,
                    role: "associate"
                }).select("_id");
                const associateIds = associates.map(a => a._id);

                baseFilter["$or"] = [
                    { partner_Id: user._id },
                    { partner_Id: { $in: associateIds } }
                ];
            } else if (user.role === "associate") {
                baseFilter.partner_Id = user._id;
            } else if (user.role === "manager") {
                // Manager does not have access to disbursed amounts in PartnerPayout
                return 0;
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

        const currentDisbursal = await getTotalDisbursedFromPayouts(currentStart, currentEnd);
        const previousDisbursal = await getTotalDisbursedFromPayouts(previousStart, previousEnd);

        const deltaPercent = previousDisbursal === 0
            ? 100
            : ((currentDisbursal - previousDisbursal) / previousDisbursal) * 100;

        // 🔹 Get lead IDs related to user
        let relatedLeadIds: mongoose.Types.ObjectId[] = [];

        if (user.role === "partner") {
            const associates = await CombinedUser.find({
                associateOf: user._id,
                role: "associate"
            }).select("_id");

            const associateIds = associates.map(a => a._id);

            const partnerLeads = await CombinedUser.find({
                partner_Lead_Id: user._id,
                role: "lead"
            }).select("_id");

            const associateLeads = await CombinedUser.find({
                assocaite_Id: { $in: associateIds },
                role: "lead"
            }).select("_id");

            relatedLeadIds = [...partnerLeads, ...associateLeads].map(l => l._id as mongoose.Types.ObjectId);
        } else if (user.role === "manager") {
            const leads = await CombinedUser.find({
                assignedTo: user._id,
                role: "lead"
            }).select("_id");
            relatedLeadIds = leads.map(l => l._id as mongoose.Types.ObjectId);
        } else if (user.role === "associate") {
            const leads = await CombinedUser.find({
                assocaite_Id: user._id,
                role: "lead"
            }).select("_id");
            relatedLeadIds = leads.map(l => l._id as mongoose.Types.ObjectId);
        }

        // 🔸 Active Leads This Month
        const activeLeads = await CombinedUser.find({
            _id: { $in: relatedLeadIds },
            $or: [
                { createdAt: { $gte: currentStart, $lte: currentEnd } },
                { updatedAt: { $gte: currentStart, $lte: currentEnd } }
            ]
        }).select("email mobile");

        const uniqueSet = new Set();
        activeLeads.forEach((lead) => {
            const key = `${lead.email}-${lead.mobile}`;
            uniqueSet.add(key);
        });

        let commissionEarned = null;

        if (user.role === "partner") {
            const payouts = await PartnerPayoutModel.find({
                partner_Id: user._id
            }).populate("disbursedId");

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

                if (disbursedTime >= currentStart.getTime() && disbursedTime <= currentEnd.getTime()) {
                    thisMonthTotal += net;
                    thisMonthGrossTotal += gross;
                } else if (disbursedTime >= previousStart.getTime() && disbursedTime <= previousEnd.getTime()) {
                    previousMonthTotal += net;
                    previousMonthGrossTotal += gross;
                }
            }
            const thisMonthPercent = thisMonthGrossTotal > 0 ? (thisMonthTotal / thisMonthGrossTotal) * 100 : 0;
            const previousMonthPercent = previousMonthGrossTotal > 0 ? (previousMonthTotal / previousMonthGrossTotal) * 100 : 0;

            const deltaCommissionPercent = thisMonthPercent - previousMonthPercent;


            commissionEarned = {
                thisMonth: parseFloat(thisMonthTotal.toFixed(2)),
                previousMonth: parseFloat(previousMonthTotal.toFixed(2)),
                deltaPercent: parseFloat(deltaCommissionPercent.toFixed(2))
            };
        }



        const leadsWithLeadId = await CombinedUser.find({
            _id: { $in: relatedLeadIds }
        }).select("_id leadId");

        const idToLeadIdMap = new Map<string, string>();
        leadsWithLeadId.forEach((lead: any) => {
            if (lead.leadId) {
                idToLeadIdMap.set(lead._id.toString(), lead.leadId);
            }
        });

        const leadIdsForTimeline = Array.from(idToLeadIdMap.values());


        const getTimelineStats = async (
            start: Date,
            end: Date,
            status: "approved" | "rejected"
        ) => {
            const timelines = await Timeline.find({
                leadId: { $in: leadIdsForTimeline },
                status,
                createdAt: { $gte: start, $lte: end }
            }).select("leadId");

            const uniqueLeadIds = new Set(timelines.map(t => t.leadId.toString()));
            return uniqueLeadIds.size;
        };

        // 🔹 Current & Previous Approvals
        const currentApproved = await getTimelineStats(currentStart, currentEnd, "approved");
        const previousApproved = await getTimelineStats(previousStart, previousEnd, "approved");

        const currentApprovalPercent =
            activeLeads.length > 0 ? (currentApproved / activeLeads.length) * 100 : 0;
        const previousApprovalPercent =
            activeLeads.length > 0 ? (previousApproved / activeLeads.length) * 100 : 0;

        const deltaApprovalPercent = currentApprovalPercent - previousApprovalPercent;

        // 🔹 Current & Previous Rejections (Only if manager or associate)
        // 🔹 Rejection Rate
        const currentRejected = await getTimelineStats(currentStart, currentEnd, "rejected");
        const previousRejected = await getTimelineStats(previousStart, previousEnd, "rejected");

        const currentRejectionPercent =
            activeLeads.length > 0 ? (currentRejected / activeLeads.length) * 100 : 0;
        const previousRejectionPercent =
            activeLeads.length > 0 ? (previousRejected / activeLeads.length) * 100 : 0;
        const deltaRejectionPercent = currentRejectionPercent - previousRejectionPercent;


        return {
            totalDisbursal: {
                current: currentDisbursal,
                previous: previousDisbursal,
                deltaPercent: parseFloat(deltaPercent.toFixed(2))
            },
            activeLeads: {
                count: activeLeads.length,
                unique: uniqueSet.size
            },
            ...(commissionEarned && { commissionEarned }),
            approvalRate: {
                currentPercent: parseFloat(currentApprovalPercent.toFixed(2)),
                previousPercent: parseFloat(previousApprovalPercent.toFixed(2)),
                deltaPercent: parseFloat(deltaApprovalPercent.toFixed(2))
            },
            rejectionRate: {
                currentPercent: parseFloat(currentRejectionPercent.toFixed(2)),
                previousPercent: parseFloat(previousRejectionPercent.toFixed(2)),
                deltaPercent: parseFloat(deltaRejectionPercent.toFixed(2))
            }
        };
    },

    async getRejectionReasonCount(params: RejectionReasonCount) {
        const { period, loanType, associateId, userId } = params;

        const user = await CombinedUser.findById(userId);
        if (!user) throw new Error("User not found");

        const baseQuery: any = { role: "lead" };

        // Filter by loanType and associateId if given
        if (loanType) baseQuery["loan.type"] = loanType;
        if (associateId) baseQuery["assocaite_Lead_Id"] = associateId;

        // Filter by role relationships
        if (user.role === "manager") {
            baseQuery.assignedTo = user._id;
        } else if (user.role === "partner") {
            baseQuery.partner_Lead_Id = user._id;
        } else if (user.role === "associate") {
            baseQuery.assocaite_Lead_Id = user._id;
        }

        // Filter by date (month) if `period` given
        let start: Date | undefined, end: Date | undefined;
        if (period) {
            start = dayjs(period).startOf("month").toDate();
            end = dayjs(period).endOf("month").toDate();
            baseQuery.createdAt = { $gte: start, $lte: end };
        }

        console.log(baseQuery);

        // ✅ Fetch all relevant lead docs once
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

        const aggregate = await Timeline.aggregate(aggregateQuery);
        const total = aggregate.reduce((sum, item) => sum + item.count, 0);

        const rejectionReasonCount = aggregate.map((item) => ({
            reason: item._id,
            count: item.count,
            percent: parseFloat(((item.count / total) * 100).toFixed(1))
        }));

        return rejectionReasonCount;
    },

    async getTrends(params: TrendsData) {
        const { period, loanType, associateId, userId } = params;

        const user = await CombinedUser.findById(userId);
        if (!user) throw new Error("User not found");
        const isPartner = user.role === "partner";

        const trendMonths = 3; // default last 3 months
        const startDate = period
            ? dayjs(period).startOf("month").subtract(trendMonths - 1, "month").toDate()
            : dayjs().startOf("month").subtract(trendMonths - 1, "month").toDate();

        // ------------------ LEADS ADDED ------------------
        const leadMatch: any = {
            role: "lead",
            createdAt: { $gte: startDate },
        };
        if (loanType) leadMatch["loan.type"] = loanType;
        if (associateId) leadMatch["assocaite_Lead_Id"] = new mongoose.Types.ObjectId(associateId);

        const leadsAgg = await CombinedUser.aggregate([
            { $match: leadMatch },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    value: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const leadsAdded = leadsAgg.map(item => ({
            month: item._id,
            value: item.value,
        }));

        // ------------------ DISBURSALS ------------------
        const disbursalMatch: any = {
            actualDisbursedDate: { $gte: startDate },
        };

        // filter DisbursedForm by associate or loanType if needed
        let leadUserIds: mongoose.Types.ObjectId[] | null = null;

        if (associateId || loanType) {
            const userMatch: any = {};
            if (associateId) userMatch["assocaite_Lead_Id"] = new mongoose.Types.ObjectId(associateId);
            if (loanType) userMatch["loan.type"] = loanType;

            const matchedUsers = await CombinedUser.find(userMatch).select("_id");
            leadUserIds = matchedUsers.map(user => user._id as mongoose.Types.ObjectId);
            disbursalMatch["leadUserId"] = { $in: leadUserIds };
        }

        const disbursalAgg = await DisbursedForm.aggregate([
            { $match: disbursalMatch },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$actualDisbursedDate" } },
                    value: { $sum: "$loanAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const disbursals = disbursalAgg.map(item => ({
            month: item._id,
            value: item.value,
        }));

        // ------------------ PAYOUTS (Placeholder) ------------------
        let payouts: { month: string; value: number }[] | null = null;

        if (isPartner) {
            const payoutAgg = await PartnerPayoutModel.aggregate([
                {
                    $match: {
                        partner_Id: new mongoose.Types.ObjectId(userId),
                        payoutStatus: "paid",
                        updatedAt: { $gte: startDate },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } },
                        value: { $sum: "$commission" },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            payouts = payoutAgg.map(item => ({
                month: item._id,
                value: item.value,
            }));
        }

        return { leadsAdded, disbursals, payouts };

    },

    async getMatrix(params: MatrixData) {
        const { period, loanType, associateId, userId } = params;

        const user = await CombinedUser.findById(userId);
        if (!user) throw new Error("User not found");

        const start = period ? dayjs(period).startOf("month").toDate() : dayjs().startOf("month").toDate();
        const end = period ? dayjs(period).endOf("month").toDate() : dayjs().endOf("month").toDate();

        const leadMatch: any = {
            role: "lead",
            createdAt: { $gte: start, $lte: end }
        };
        if (loanType) leadMatch["loan.type"] = loanType;
        if (associateId) leadMatch["assocaite_Lead_Id"] = new mongoose.Types.ObjectId(associateId);

        const leads = await CombinedUser.find(leadMatch).select("createdAt _id");

        const leadIds = leads.map(lead => lead._id);

        // --- Disbursed Leads in the period ---
        const disbursedMatch: any = {
            leadUserId: { $in: leadIds },
            actualDisbursedDate: { $gte: start, $lte: end },
        };

        const disbursals = await DisbursedForm.find(disbursedMatch).select("loanAmount actualDisbursedDate leadUserId");

        const disbursedLeadsCount = disbursals.length;
        const totalLeadsCount = leads.length;

        // --- Disbursal Rate ---
        const disbursalRatePct = totalLeadsCount > 0
            ? parseFloat(((disbursedLeadsCount / totalLeadsCount) * 100).toFixed(1))
            : 0;

        // --- Avg. TAT (in days) ---
        const leadCreatedMap = new Map<string, Date>(
            leads.map((lead: any) => [lead._id.toString(), lead.createdAt])
        );

        const tatList: number[] = disbursals
            .map((d: any) => {
                const createdAt = leadCreatedMap.get(d.leadUserId.toString());
                if (!createdAt) return null;
                const diff = dayjs(d.actualDisbursedDate).diff(dayjs(createdAt), "day", true);
                return diff;
            })
            .filter((d): d is number => d !== null);

        const avgDisbursalTATdays =
            tatList.length > 0 ? parseFloat((tatList.reduce((a, b) => a + b, 0) / tatList.length).toFixed(1)) : 0;

        // --- Avg. Loan Amount ---
        const avgLoanAmount =
            disbursals.length > 0
                ? Math.round(disbursals.reduce((sum, d) => sum + (d.loanAmount || 0), 0) / disbursals.length)
                : 0;

        // --- Target Achieved ---
        const targetAchievedPct = null; // Placeholder unless your business logic provides it

        return {
            disbursalRatePct,
            avgDisbursalTATdays,
            avgLoanAmount,
            targetAchievedPct
        };
    }


}