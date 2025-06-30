import { ChangeRequestModel } from "../../model/ChangeRequest.model";
import { OTP } from "../../model/otp.model";
import PartnerPayoutModel from "../../model/PartnerPayout.model";
import { CombinedUser } from "../../model/user/user.model";
import { hashPassword } from "../../utils/hash";
import { generateRandomPassword, generateUniquePartnerId, uploadFileToS3 } from "../../utils/helper";
import { sendPasswordEmail } from "../common.service";


export const partnerService = {

    createPartner: async (data: any, files: any) => {
        console.log("🚀 Starting createPartner");
        console.log("📦 Received data:", JSON.stringify(data, null, 2));
        console.log("📁 Received files:", Object.keys(files || {}));

        console.log("🔍 Checking if partner already exists...");
        const existing = await CombinedUser.findOne({
            $or: [
                { 'basicInfo.email': data.basicInfo.email },
                { 'basicInfo.mobile': data.basicInfo.mobile }
            ]
        });
        if (existing) {
            console.error("❌ Partner already exists with same email or mobile:", {
                email: data.basicInfo.email,
                mobile: data.basicInfo.mobile
            });
            throw new Error("Partner already exists");
        }

        const documentKeys = [
            'profilePhoto',
            'panCard',
            'aadharFront',
            'aadharBack',
            'cancelledCheque',
            'gstCertificate',
            'aditional',
        ];

        const documents: { [key: string]: string } = {};


        console.log("📤 Uploading documents to S3...");
        for (const key of documentKeys) {
            const file = files[key]?.[0];
            if (file) {
                console.log(`📄 Uploading ${key}...`);
                const s3Url = await uploadFileToS3(file, 'partners');
                documents[key] = s3Url;
                console.log(`✅ Uploaded ${key}:`, s3Url);
            }
        }

        const partnerId = await generateUniquePartnerId();
        console.log("✅ Generated partnerId:", partnerId);

        const rawPassword = generateRandomPassword();
        const hashed = await hashPassword(rawPassword);

        const partnerPayload = {
            basicInfo: data.basicInfo,
            personalInfo: data.personalInfo,
            addressDetails: data.addressDetails,
            bankDetails: data.bankDetails,
            password: hashed,
            partnerId,
            documents,
            role: 'partner',
            email: data.basicInfo.email,
            mobile: data.basicInfo.mobile,
        };

        console.log("📦 Partner payload ready:", JSON.stringify(partnerPayload, null, 2));

        console.log("🛠️ Creating partner in DB...");
        const partner = await CombinedUser.create(partnerPayload);
        console.log("✅ Partner created successfully:", partner._id);

        await sendPasswordEmail(data.basicInfo.email, data.basicInfo.fullName, rawPassword);
        console.log("✅ Password email sent");

        return partner;
    },

    getPartnerById: async (id: string) => {
        return await CombinedUser.findById(id);
    },

    getAllPartners: async () => {
        const partners = await CombinedUser.aggregate([
            {
                $match: { role: 'partner' }
            },
            {
                $lookup: {
                    from: 'changerequests', // Mongoose auto-pluralizes model names
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'changeRequests'
                }
            },
            {
                $addFields: {
                    pendingChangeRequestCount: {
                        $size: {
                            $filter: {
                                input: '$changeRequests',
                                as: 'req',
                                cond: { $eq: ['$$req.status', 'pending'] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    changeRequests: 0 // exclude full changeRequest data if not needed
                }
            },
            {
                $sort: { createdAt: -1 } // ✅ sort by creation date (latest first)
            }
        ]);

        return partners;
    },

    editPartner: async (id: string, data: any) => {
        const partner = await CombinedUser.findById(id);
        if (!partner) throw new Error("Partner not found");

        // Update root level email/mobile if needed
        partner.email = data.basicInfo?.email || partner.email;
        partner.mobile = data.basicInfo?.mobile || partner.mobile;

        // Merge all nested updates
        partner.basicInfo = { ...partner.basicInfo, ...data.basicInfo };
        partner.personalInfo = { ...partner.personalInfo, ...data.personalInfo };

        partner.commissionPlan = data?.commission || partner.commissionPlan;


        const payouts = await PartnerPayoutModel.find({ partner_Id: id });

        for (const payout of payouts) {
            let payoutModified = false;

            if (data.basicInfo.fullName && payout.partner.name !== data.basicInfo.fullName) {
                payout.partner.name = data.basicInfo.fullName;
                payoutModified = true;
            }

            if (payoutModified) await payout.save();
        }

        await partner.save();
        return partner;
    },


    verifyOtp: async (email: string, otp: string) => {

        const otpEntry = await OTP.findOne({ email });

        if (!otpEntry) {
            throw new Error("OTP not found or expired");
        }
        if (otpEntry.otp.toString() !== otp) {
            throw new Error("Invalid Otp");
        }

        await OTP.deleteOne({ email });
    }
}