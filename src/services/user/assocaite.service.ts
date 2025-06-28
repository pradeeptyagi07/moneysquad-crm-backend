import { ICombinedUser } from "../../model/user/interfaces";
import { CombinedUser } from "../../model/user/user.model";
import { hashPassword } from "../../utils/hash";
import { generateRandomPassword, generateUniqueAssociateId } from "../../utils/helper";
import { sendPasswordEmail } from "../common.service";
import mongoose from "mongoose";

export const associateService = {
    // Create Associate
    createAssociate: async (partnerId: string, data: Partial<ICombinedUser>) => {
        const existing = await CombinedUser.findOne({ email: data.email });
        if (existing) throw new Error("Email already exists");


        const password = generateRandomPassword();
        const hashedPassword = await hashPassword(password);

        const associateId = await generateUniqueAssociateId();

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
        return await CombinedUser.findOneAndUpdate(
            {
                _id: associateId,
                associateOf: partnerId,
                role: "associate",
            },
            update,
            { new: true }
        );
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
