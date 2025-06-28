import { CombinedUser } from "../../model/user/user.model";
import { hashPassword } from "../../utils/hash";
import { generateRandomPassword, generateUniqueManagerId } from "../../utils/helper";
import { sendPasswordEmail } from "../common.service";


export const managerService = {

    createManager: async (data: any) => {
        const existing = await CombinedUser.findOne({ email: data.email });
        if (existing) throw new Error("Email already exists");

        const rawPassword = generateRandomPassword();
        const hashed = await hashPassword(rawPassword);

        const managerId = await generateUniqueManagerId();

        const newManager = await CombinedUser.create({
            ...data,
            password: hashed,
            role: 'manager',
            managerId,
            status: 'active'
        });

        await sendPasswordEmail(data.email, `${data.firstName} ${data.lastName}`, rawPassword);
        
        return newManager;
    },
    
    getAllManager: async () => {
        return await CombinedUser.find({ role: "manager" }).sort({updatedAt: -1});
    },
    getManager: async (id: string) => {
        return await CombinedUser.findById(id);
    },
    updateManager: async (id: string, data: any) => {
        return await CombinedUser.findOneAndUpdate({ _id: id, role: "manager" }, data, { new: true });
    },
    deleteManager: async (id: string) => {
        return await CombinedUser.findOneAndDelete({ _id: id, role: "manager" });
    },
};