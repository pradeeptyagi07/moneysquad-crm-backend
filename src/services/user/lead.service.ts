import DisbursedForm from "../../model/disbursedForm.model";
import PartnerPayoutModel from "../../model/PartnerPayout.model";
import { Timeline } from "../../model/timeline.model";
import { Remark } from "../../model/Remarks.model";
import { CombinedUser } from "../../model/user/user.model";
import { hashPassword } from "../../utils/hash";
import { generateRandomPassword, generateUniqueLeadId, uploadFileToS3 } from "../../utils/helper";
import dayjs from "dayjs";

export const leadService = {

    async createLead(userId: string, leadData: any) {
        // Check if the creator user exists (optional validation)
        const creatorUser = await CombinedUser.findById(userId);
        console.log("creatorUser", creatorUser)
        if (!creatorUser) throw new Error("Creator user not found");

        let finalStatus;
        let partnerNewId;
        let assocaite_Id;
        if (creatorUser.role === "associate" || creatorUser.role === "partner") {
            finalStatus = "new lead"
        } else {
            finalStatus = "pending"
        }

        if (creatorUser.role === "associate") {
            partnerNewId = creatorUser.associateOf;
            assocaite_Id = creatorUser._id;
        } else if (creatorUser.role === "partner") {
            partnerNewId = userId
        } else {
            partnerNewId = leadData.partnerId;
        }


        const leadId = await generateUniqueLeadId();

        const rawPassword = generateRandomPassword();
        const hashed = await hashPassword(rawPassword);

        // Create new lead user document
        const newLead = new CombinedUser({
            applicantName: leadData.applicantName,
            applicantProfile: leadData.applicantProfile,
            businessName: leadData.businessName,
            email: leadData.email,
            mobile: leadData.mobile,
            pincode: {
                pincode: leadData.pincode,
                city: leadData.city,
                state: leadData.state,
            },

            loan: {
                type: leadData.loantType,
                amount: leadData.loanAmount
            },
            comments: leadData.comments,
            assignedTo: leadData.assignto,
            lenderType: leadData.lenderType,
            role: "lead",
            password: hashed,
            leadId: leadId,
            partner_Lead_Id: partnerNewId,
            assocaite_Lead_Id: assocaite_Id,
            status: finalStatus,
        });

        // Save the lead user document
        await newLead.save();

        const entry = new Timeline({
            leadId: newLead.leadId,
            applicantName: leadData.applicantName,
            status: finalStatus,
            message: `Lead created by ${creatorUser.role} ${creatorUser.basicInfo?.fullName}`
        });

        await entry.save();

        return {
            id: newLead._id,
            applicant: newLead.applicant,
            loan: newLead.loan,
        };
    },

    async editLead(userId: string, leadId: string, data: any) {

        const creatorUser = await CombinedUser.findById(userId);
        if (!creatorUser) {
            throw new Error("Unauthorized: Creator user not found.");
        }

        console.log("role", creatorUser.role);

        const lead = await CombinedUser.findOne({ _id: leadId, role: "lead" });
        if (!lead) {
            throw new Error("Lead not found.");
        }

        const isPrivileged = ["admin", "manager"].includes(creatorUser.role);

        const editableFields: Record<string, boolean> = {
            applicantName: true,
            applicantProfile: true,
            businessName: true,
            mobile: true,
            email: true,
            pincode: true,
            city: true,
            state: true,
            loantType: true,
            loanAmount: true,
            comments: true,
            partnerId: true,
            assignedTo: isPrivileged,
            lenderType: isPrivileged,
        };

        for (const key in data) {
            if (!editableFields[key]) continue;

            switch (key) {
                case "loanAmount":
                    lead.loan.amount = data.loanAmount;
                    break;
                case "loantType":
                    lead.loan.type = data.loantType;
                    break;
                case "pincode":
                case "city":
                case "state":
                    lead.pincode = {
                        ...lead.pincode,
                        [key]: data[key],
                    };
                    break;
                case "assignedTo":

                    console.log("lead.assignedTo", lead.assignedTo)
                    // Check if lead was never assigned before
                    if (lead.assignedTo === null || lead.assignedTo === undefined) {
                        // First time assignment
                        lead.assignedTo = data.assignedTo;
                        lead.status = "pending"; // set status only for new assignment
                    } else {
                        // Reassignment — keep the old status
                        lead.assignedTo = data.assignedTo;
                    }

                    const entry = new Timeline({
                        leadId: lead.leadId,
                        applicantName: lead.applicantName,
                        status: "pending",
                        message: `Lead assigned to Manager by ${creatorUser.role} ${creatorUser.firstName} ${creatorUser.lastName}`,
                    });
                    await entry.save();
                    break;
                default:
                    (lead as any)[key] = data[key];
            }
        }

        console.log("Final lead object before saving:", JSON.stringify(lead, null, 2));

        await lead.save();

        const { applicantName, businessName, loantType, lenderType } = data;
        if (applicantName || businessName || loantType || lenderType) {
            const payouts = await PartnerPayoutModel.find({ lead_Id: leadId });

            for (const payout of payouts) {
                let payoutModified = false;

                if (applicantName && payout.applicant.name !== applicantName) {
                    payout.applicant.name = applicantName;
                    payoutModified = true;
                }

                if (businessName && payout.applicant.business !== businessName) {
                    payout.applicant.business = businessName;
                    payoutModified = true;
                }

                if (loantType && payout.lender.loanType !== loantType) {
                    payout.lender.loanType = loantType;
                    payoutModified = true;
                }

                if (lenderType && payout.lender.name !== lenderType) {
                    payout.lender.name = lenderType;
                    payoutModified = true;
                }

                if (payoutModified) await payout.save();
            }
        }
        return lead;
    },

    async createDuplicateLead(userId: string, leadData: any) {
        const creatorUser = await CombinedUser.findById(userId);
        if (!creatorUser) throw new Error("Unauthorized");

        const similarLeads = await CombinedUser.find({
            role: "lead",
            $or: [
                { email: leadData.email },
                { mobile: leadData.mobile }
            ]
        });

        const sameLenderTypeLead = similarLeads?.find(
            lead => lead.lenderType === leadData.lenderType
        );

        if (sameLenderTypeLead) {
            throw new Error("A lead with the same lender type, email or mobile already exists");
        }

        // Find the most recent lead (with a different lenderType) to check its status and age
        const existingLead = similarLeads[0];
        if (!existingLead) {
            throw new Error("No matching lead found with same mobile/email");
        }

        if (!existingLead) {
            throw new Error("No matching closed lead found with same mobile/email and lenderType");
        }

        // Reuse the logic from original createLead
        return await leadService.createLead(userId, leadData);
    },

    async getAllLeads(userID: string) {

        const user = await CombinedUser.findById(userID);

        let filter: any = {};
        if (user?.role === "partner") {
            filter = { partner_Lead_Id: userID };
        } else if (user?.role === "manager") {
            filter = { assignedTo: userID };
        } else if (user?.role === "associate") {
            filter = { assocaite_Lead_Id: user._id };
        }

        console.log("filter", filter)

        const leads = await CombinedUser.find(
            {
                role: "lead",
                ...filter
            },
            {
                applicantName: 1,
                applicantProfile: 1,
                businessName: 1,
                email: 1,
                mobile: 1,
                pincode: 1,
                loan: 1,
                comments: 1,
                partner_Lead_Id: 1,
                assocaite_Lead_Id: 1,
                assignedTo: 1,
                lenderType: 1,
                leadId: 1,
                createdAt: 1,
                status: 1,
            })
            .sort({ updatedAt: -1 })
            .populate({
                path: 'partner_Lead_Id',
                select: 'basicInfo.fullName partnerId',
                strictPopulate: false,
            })
            .populate({
                path: 'assignedTo',
                select: 'managerId firstName lastName email mobile',
                strictPopulate: false,
            })
            .populate({
                path: 'assocaite_Lead_Id',
                select: 'associateDisplayId firstName lastName',
                strictPopulate: false,
            });

        const result = await Promise.all(
            leads.map(async (lead) => {
                const disbursed = await DisbursedForm.findOne({ leadUserId: lead._id });

                const latestTimeline = await Timeline.findOne({ leadId: lead.leadId })
                    .sort({ createdAt: -1 });

                return {
                    id: lead._id,
                    applicantName: lead.applicantName,
                    applicantProfile: lead.applicantProfile,
                    businessName: lead.businessName,
                    email: lead.email,
                    mobile: lead.mobile,
                    pincode: lead.pincode,
                    comments: lead.comments,
                    loan: lead.loan,
                    lenderType: lead.lenderType || null,
                    partnerId: lead.partner_Lead_Id,
                    manager: lead.assignedTo || null,
                    associate: lead.assocaite_Lead_Id || null,
                    leadId: lead.leadId,
                    status: lead.status,
                    createdAt: lead.createdAt,
                    disbursedData: disbursed || null,
                    statusUpdatedAt: latestTimeline?.createdAt || null,
                };
            })
        );

        return result;
    },

    async getLeadById(id: string) {
        const lead = await CombinedUser.findOne(
            { _id: id, role: "lead" },
            {
                applicantName: 1,
                applicantProfile: 1,
                businessName: 1,
                email: 1,
                mobile: 1,
                pincode: 1,
                loan: 1,
                comments: 1,
                partner_Lead_Id: 1,
                assocaite_Lead_Id: 1,
                manager_assigned: 1,
                lenderType: 1,
                leadId: 1,
                createdAt: 1,
                status: 1,
            }
        )
            .populate({
                path: 'partner_Lead_Id',
                select: 'basicInfo.fullName partnerId basicInfo.mobile basicInfo.email',
                strictPopulate: false,
            })
            .populate({
                path: 'assignedTo',
                select: 'firstName lastName email mobile',
                strictPopulate: false,
            })
            .populate({
                path: 'assocaite_Lead_Id',
                select: 'associateDisplayId firstName lastName email mobile',
                strictPopulate: false,
            });

        if (!lead) throw new Error("Lead not found");

        const disbursed = await DisbursedForm.findOne({ leadUserId: lead?._id });
        const latestTimeline = await Timeline.findOne({ leadId: lead?.leadId })
            .sort({ createdAt: -1 });

        console.log("lead", lead)

        return {
            id: lead._id,
            applicantName: lead.applicantName,
            applicantProfile: lead.applicantProfile,
            businessName: lead.businessName,
            email: lead.email,
            mobile: lead.mobile,
            pincode: lead.pincode,
            comments: lead.comments,
            loan: lead.loan,
            lenderType: lead.lenderType || null,
            partnerId: lead.partner_Lead_Id,
            manager: lead.assignedTo || null,
            associate: lead.assocaite_Lead_Id || null,
            leadId: lead.leadId,
            status: lead.status,
            createdAt: lead.createdAt,
            disbursedData: disbursed || null,
            statusUpdatedAt: latestTimeline?.createdAt || null,
        };
    },

    deleteLead: async (id: string) => {
        const deletedLead = await CombinedUser.findOneAndDelete({ _id: id, role: "lead" });
        const disbursed = await DisbursedForm.findOneAndDelete({
            leadId: deletedLead?.leadId
        })
        return deletedLead;
    },

    async getTimeLine(leadId: string) {
        const entries = await Timeline.find({ leadId }).sort({ createdAt: 1 });

        console.log(entries)

        const categorized: any = {
            pending: null,
            new_lead: null,
            login: null,
            rejected: null,
            disbursed: null,
            closed: null,
            expired: null,
            approved: null,
        };

        for (const entry of entries) {
            const status = entry.status?.toLowerCase();

            if (status === "pending") categorized.pending = entry;
            else if (status === "new lead") categorized.new_lead = entry;
            else if (status === "login") categorized.login = entry;
            else if (status === "rejected") categorized.rejected = entry;
            else if (status === "disbursed") categorized.disbursed = entry;
            else if (status === "closed") categorized.closed = entry;
            else if (status === "expired") categorized.expired = entry;
            else if (status === "approved") categorized.approved = entry;
        }

        return categorized;
    },

    assignManagerToLead: async (leadId: string, userId: string, data: any) => {
        const user = await CombinedUser.findById(userId);

        const lead = await CombinedUser.findOne({ _id: leadId, role: "lead" });
        if (!lead) {
            throw new Error("Lead not found");
        }

        const alreadyAssigned = !!lead.assignedTo;

        if (!alreadyAssigned) {
            lead.assignedTo = data.manager_assigned;
            lead.status = "pending";
        } else {
            lead.assignedTo = data.manager_assigned;
        }

        await lead.save();


        const entry = new Timeline({
            leadId: lead.leadId,
            applicantName: lead.applicantName,
            status: "pending",
            message: `Lead assigned by ${user?.role} (${user?.email})`
        });

        await entry.save();
        return lead;
    },

    updateLeadStatus: async (leadId: string, userId: string, data: any, files: any) => {
        const creatorUser = await CombinedUser.findOne({ _id: userId });
        if (!creatorUser) {
            throw new Error("creatorUser not found");
        }

        let messageData;

        if (creatorUser.role === "admin") {
            messageData = `Lead Status updated by ${creatorUser.role} ${creatorUser.firstName} ${creatorUser.lastName}`
        } else if (creatorUser.role === "manager") {
            messageData = `Lead Status updated by ${creatorUser.role} ${creatorUser.firstName} ${creatorUser.lastName} {(${creatorUser.managerId})}`
        }
        const lead = await CombinedUser.findOne({ _id: leadId, role: "lead" })
            .populate(["partner_Lead_Id", "assocaite_Lead_Id"]);
        if (!lead) {
            throw new Error("Lead not found");
        }

        if (data.action === "approved") {
            lead.loan.amount = Number(data.approvedAmount);
        }

        // Upload image if provided
        let s3url;
        if (files.rejectImage?.[0]) {
            s3url = await uploadFileToS3(files.rejectImage?.[0], 'rejectImage');
            data.rejectImage = s3url;
        }

        lead.status = data.action;


        await lead.save();

        if (data.action === "disbursed") {
            const partnerUser = lead.partner_Lead_Id as any;
            const associateUser = lead.assocaite_Lead_Id as any;

            if (!partnerUser || !partnerUser.partnerId) {
                console.error("❌ Partner info missing");
                throw new Error("Partner data is incomplete");
            }

            const payout = new PartnerPayoutModel({
                lead_Id: lead._id,
                leadId: lead.leadId,
                partner_Id: lead.partner_Lead_Id,
                partner: {
                    name: partnerUser.basicInfo?.fullName,
                    partnerId: partnerUser.partnerId,
                },
                associate: associateUser
                    ? {
                        name: `${associateUser.firstName || ""} ${associateUser.lastName || ""}`.trim(),
                        associateDisplayId: associateUser.associateDisplayId || "",
                    }
                    : {
                        name: "",
                        associateDisplayId: "",
                    },
                applicant: {
                    name: lead.applicantName,
                    business: lead.businessName || '',
                },
                lender: {
                    name: lead.lenderType,
                    loanType: lead.loan?.type,
                },
                disbursedAmount: 0,
                payoutStatus: "pending",
                warning: false,
                remark: ""
            });

            await payout.save()
        }

        console.log("sss", data.action)

        if (data.action === "closed") {
            console.log("🔒 Lead status is being updated to 'closed'. Checking payout data...");

            const payoutData = await PartnerPayoutModel.findOne({
                lead_Id: lead._id,
            });

            if (payoutData) {
                console.log(`✅ Payout found for Lead ID: ${lead._id}`);
                console.log(`ℹ️ Current payout status: ${payoutData.payoutStatus}`);

                if (payoutData.payoutStatus === "pending") {
                    const deleteResult = await PartnerPayoutModel.deleteOne({ _id: payoutData._id });
                    console.log(`🗑️ Payout with status 'pending' deleted. Result:`, deleteResult);
                } else if (payoutData.payoutStatus === "paid") {
                    payoutData.warning = true;
                    const updated = await payoutData.save();
                    console.log(`⚠️ Payout with status 'paid' updated with warning flag. Updated Data:`, updated);
                } else {
                    console.log(`❗ Unexpected payout status '${payoutData.payoutStatus}' for Lead ID: ${lead._id}`);
                }
            } else {
                console.log(`ℹ️ No payout found for leadId: ${lead._id}`);
            }
        }


        const entry = new Timeline({
            leadId: lead.leadId,
            applicantName: lead.applicantName,
            status: data.action,
            message: messageData,
            closeReason: data.closeReason || undefined,
            rejectImage: s3url || undefined,
            rejectReason: data.rejectReason || undefined,
            rejectComment: data.comment || undefined,
        });

        await entry.save();

        return {
            timelineId: entry._id,
            status: entry.status,
            rejectImage: entry.rejectImage,
            rejectReason: entry.rejectReason,
            rejectComment: entry.rejectComment,
            createdAt: entry.createdAt
        };
    },

    createDisbursed: async (id: string, data: any) => {
        const lead = await CombinedUser.findById(id);
        if (!lead) throw new Error("Lead not found");

        const payout = await PartnerPayoutModel.findOne({ lead_Id: lead._id });
        if (!payout) throw new Error("Payout entry not found for this lead");

        lead.loan.amount = data.loanAmount;
        await lead.save();

        const existing = await DisbursedForm.findOne({ leadId: lead.leadId });
        if (existing) throw new Error("Form already exists for this lead");

        const form = new DisbursedForm({
            ...data,
            leadUserId: lead._id,
            actualDisbursedDate: new Date(data.actualDisbursedDate),
        });

        const disbursedForm = await form.save();

        payout.disbursedAmount = data.loanAmount;
        payout.disbursedId = disbursedForm._id;

        await payout.save();
        const updatePayload: any = {};
        if (form.actualDisbursedDate) {
            const date = new Date(form.actualDisbursedDate);
            if (!isNaN(date.getTime())) {
                updatePayload.createdAt = date;
            }
        }

        if (updatePayload.createdAt) {
        const payout = await PartnerPayoutModel.findOne({ lead_Id: lead._id });

        if (!payout) {
            throw new Error("Partner payout not found for this lead");
        }

        payout.createdAt = updatePayload.createdAt;
        await payout.save();
        }
        return disbursedForm
    },

    updateDisbursed: async (id: string, data: any) => {

        const lead = await CombinedUser.findById(id);
        if (!lead) throw new Error("Lead not found");

        const payout = await PartnerPayoutModel.findOne({ lead_Id: lead._id });
        if (!payout) throw new Error("Payout entry not found for this lead");

        lead.loan.amount = data.loanAmount;
        payout.disbursedAmount = data.loanAmount;


        await lead.save()
        const form = await DisbursedForm.findOne({ leadUserId: id });
        if (!form) throw new Error("Disbursed form not found for this lead");

        // Allowed fields based on schema
        const updatableFields = [
            "loanAmount",
            "tenureMonths",
            "interestRatePA",
            "processingFee",
            "insuranceCharges",
            "loanScheme",
            "lanNumber",
            "actualDisbursedDate"
        ];

        updatableFields.forEach((field) => {
            if (data[field] !== undefined && data[field] !== null) {
                if (field === "actualDisbursedDate") {
                    const date = new Date(data[field]);
                    if (!isNaN(date.getTime())) {
                        (form as any)[field] = date;
                    } else {
                        throw new Error("Invalid date format for actualDisbursedDate");
                    }
                } else {
                    (form as any)[field] = data[field];
                }
            }
        });


        await payout.save();
        const disbursedForm = await form.save();

        const updatePayload: any = {};
        if (form.actualDisbursedDate) {
            const date = new Date(form.actualDisbursedDate);
            if (!isNaN(date.getTime())) {
                updatePayload.createdAt = date;
            }
        }

        if (updatePayload.createdAt) {
        const payout = await PartnerPayoutModel.findOne({ lead_Id: lead._id });

        if (!payout) {
            throw new Error("Partner payout not found for this lead");
        }

        payout.createdAt = updatePayload.createdAt;
        await payout.save();
        }
        return disbursedForm;
        
    }
,

    addRemark: async (leadId: string, remarkMessage: string, userId: string) => {
    if (!remarkMessage || typeof remarkMessage !== 'string') {
        throw new Error('Message must be a non-empty string');
    }

    const user = await CombinedUser.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    let clientName: string;
    if (user.role === 'partner') {
        clientName = user.basicInfo.fullName;
    } else {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        clientName = `${firstName} ${lastName}`.trim();
    }

    const remarkDoc = await Remark.findOne({ leadId });

    if (!remarkDoc) {
        // No remark for this lead, create new
        const newRemark = new Remark({
            leadId,
            remarkMessage: [{
                userId,
                name: clientName,
                role: user.role,
                messages: [{
                    text: remarkMessage,
                    timestamp: new Date()
                }]
            }]
        });
        return await newRemark.save();
    } else {
        // Remark exists, check if user already exists in remarkMessage array
        const userIndex = remarkDoc.remarkMessage.findIndex(r => r.userId === userId);

        if (userIndex !== -1) {
            // User exists, push new message
            remarkDoc.remarkMessage[userIndex].messages.push({
                text: remarkMessage,
                timestamp: new Date()
            });
        } else {
            // User doesn't exist, push new user object
            remarkDoc.remarkMessage.push({
                userId,
                name: clientName,
                role: user.role,
                messages: [{
                    text: remarkMessage,
                    timestamp: new Date()
                }]
            });
        }

        return await remarkDoc.save();
    }
}
,

    getRemarks : async(id : string) =>{
         const remarks = await Remark.findOne({ leadId: id });
         if (!remarks) {
             throw new Error('No remarks found for this leadId');
         }

         return remarks;
    }
};
