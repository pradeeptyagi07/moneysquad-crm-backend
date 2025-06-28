import BankModel from "../model/Bank.model";


export const bankService = {
    async createBanks(banks: { name: string }[]) {
        const uniqueNames = [...new Set(banks.map((b) => b.name.trim()))];

        const existingBanks = await BankModel.find({ name: { $in: uniqueNames } });
        const existingNames = new Set(existingBanks.map((b) => b.name));

        const newBanks = uniqueNames
            .filter((name) => !existingNames.has(name))
            .map((name) => ({ name }));

        if (newBanks.length === 0) {
            throw new Error('All bank names already exist');
        }

        return await BankModel.insertMany(newBanks);
    },

    async getAllBanks() {
        return await BankModel.find().sort({ name: 1 });
    },

    async updateBank(id: string, name: string) {
        const updated = await BankModel.findByIdAndUpdate(id, { name }, { new: true });
        if (!updated) throw new Error("Bank not found");
        return updated;
    },

    async deleteBank(id: string) {
        const deleted = await BankModel.findByIdAndDelete(id);
        if (!deleted) throw new Error("Bank not found or already deleted");
        return deleted;
    }
};