import PartnerPayoutModel from "../../model/PartnerPayout.model";
import { ICombinedUser } from "../../model/user/interfaces";
import { CombinedUser } from "../../model/user/user.model";
import { hashPassword } from "../../utils/hash";
import { generateRandomPassword, generateUniqueAssociateId } from "../../utils/helper";
import { sendPasswordEmail } from "../common.service";
import mongoose from "mongoose";

export const associateService = {
    // Create Associate
    createAssociate: async (partnerId: string, data: Partial<ICombinedUser>) => {
        const partner = await CombinedUser.findOne({ _id: partnerId, role: 'partner' });
        if (!partner) throw new Error("Partner does not exist or is not a valid partner");

        const existing = await CombinedUser.findOne({ email: data.email });
        if (existing) throw new Error("Email already exists");


        const password = generateRandomPassword();
        const hashedPassword = await hashPassword(password);

        if (!partner.partnerId) throw new Error("Partner does not have a valid partnerId");

        const associateId = await generateUniqueAssociateId(partner.partnerId);

        const associate = await CombinedUser.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            mobile: data.mobile,
            location: data.location,
            password: hashedPassword,
            role: "associate",
            status: "active",
            associateOf: new mongoose.Types.ObjectId(partnerId),
            associateDisplayId: associateId,
        });

        // send email with plain password
        await sendPasswordEmail(associate.email, `${data.firstName} ${data.lastName}`, password);

        return associate;
    },

    // Get all associates of a partner
    getAssociates: async (partnerId: string) => {
        return await CombinedUser.find({
            associateOf: partnerId,
            role: "associate",
        });
    },

    // Get associate by ID (validate owner)
    getAssociateById: async (partnerId: string, associateId: string) => {
        return await CombinedUser.findOne({
            _id: associateId,
            associateOf: partnerId,
            role: "associate",
        });
    },

    // Update associate
    updateAssociate: async (
        partnerId: string,
        associateId: string,
        update: Partial<ICombinedUser>
    ) => {
        // Check if name fields are being updated
        const shouldUpdateName = 'firstName' in update || 'lastName' in update;

        // Update associate document and get the updated one
        const associate = await CombinedUser.findOneAndUpdate(
            {
                _id: associateId,
                associateOf: partnerId,
                role: "associate",
            },
            update,
            { new: true }
        );

        if (!associate) throw new Error("Associate not found");

        // If name is updated, reflect it in PartnerPayoutModel
        if (shouldUpdateName) {
            const fullName = `${associate.firstName || ''} ${associate.lastName || ''}`.trim();

            await PartnerPayoutModel.updateMany(
                {
                    partner_Id: partnerId,
                    "associate.associateDisplayId": associate.associateDisplayId
                },
                {
                    $set: {
                        "associate.name": fullName
                    }
                }
            );
        }

        return associate;
    },

    // Delete associate
    deleteAssociate: async (partnerId: string, associateId: string) => {
        const deleted = await CombinedUser.findOneAndDelete({
            _id: associateId,
            associateOf: partnerId,
            role: "associate",
        });

        return !!deleted;
    },
};
