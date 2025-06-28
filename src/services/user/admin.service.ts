import { CombinedUser } from "../../model/user/user.model";
import { hashPassword } from "../../utils/hash";
import { generateRandomPassword } from "../../utils/helper";
import { sendPasswordEmail } from "../common.service";

export const adminService = {
    createAdmin: async (data: any) => {
        const existing = await CombinedUser.findOne({ email: data.email, role: "admin" });
        if (existing) throw new Error("Email already exists");

        const rawPassword = generateRandomPassword();
        const hashed = await hashPassword(rawPassword);

        const newAdmin = await CombinedUser.create({
            ...data,
            password: hashed,
            role: 'admin'
        });

        await sendPasswordEmail(data.email, `${data.firstName} ${data.lastName}`, rawPassword);

        return newAdmin;
    },
    getAllAdmins: async () => {
        return await CombinedUser.find({ role: "admin" });
    },
    getAdminById: async (id: string) => {
        return await CombinedUser.findOne({ _id: id, role: "admin" });
    },
    updateAdmin: async (id: string, data: any) => {
        return await CombinedUser.findOneAndUpdate({ _id: id, role: "admin" }, data, { new: true });
    },
    deleteAdmin: async (id: string) => {
        return await CombinedUser.findOneAndDelete({ _id: id, role: "admin" });
    },
};