import { ProductInfoModel } from "../model/ProductInfo.model";


export const productInfoService = {
    async getProductInfo() {
        let data = await ProductInfoModel.findOne();
        if (!data) throw new Error("Product info not found.");
        return data;
    },

    async updateGuides(updatedGuides: any) {
        const info = await ProductInfoModel.findOne();
        if (!info) throw new Error("Product info not found.");
        info.guides = updatedGuides;
        await info.save();
        return info;
    },

    async updatePolicies(updatedPolicies: any) {
        const info = await ProductInfoModel.findOne();
        if (!info) throw new Error("Product info not found.");
        info.policies = updatedPolicies;
        await info.save();
        return info;
    },

    async updateDocuments(updatedDocs: any) {
        const info = await ProductInfoModel.findOne();
        if (!info) throw new Error("Product info not found.");
        info.documents = updatedDocs;
        await info.save();
        return info;
    },

    async createInitialData(initialData: any) {
        const exists = await ProductInfoModel.findOne();
        if (exists) throw new Error("Data already exists.");
        return await ProductInfoModel.create(initialData);
    }
};
