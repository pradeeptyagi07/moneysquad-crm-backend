import { LenderLoanMatrix } from "../model/lenderLoanMatrix.model";

export const lenderLoanMatrixService = {

    async getFullMatrix() {
        const entries = await LenderLoanMatrix.find()
            .populate("lenderId")
            .populate("loanTypeId");

        const matrix: {
            lenderId: string;
            lenderName: string;
            loanTypeId: string;
            loanTypeName: string;
            enabled: boolean;
        }[] = [];

        for (const entry of entries) {
            matrix.push({
                lenderId: entry.lenderId._id.toString(),
                lenderName: (entry.lenderId as any).name,
                loanTypeId: entry.loanTypeId._id.toString(),
                loanTypeName: (entry.loanTypeId as any).name,
                enabled: entry.enabled,
            });
        }

        return matrix;
    },

    async toggleMultiple(data: { lenderId: string, loanTypeId: string, enabled: boolean }[]) {
        console.log("🔁 [toggleMultiple] Received data:", data);

        const updatedEntries = [];

        for (const [index, item] of data.entries()) {

            try {
                const updated = await LenderLoanMatrix.findOneAndUpdate(
                    { lenderId: item.lenderId, loanTypeId: item.loanTypeId },
                    { enabled: item.enabled },
                    { new: true, upsert: true }
                );

                if (updated) {
                    console.log(`✅ [toggleMultiple] Updated mapping for lenderId: ${item.lenderId}, loanTypeId: ${item.loanTypeId}`);
                    updatedEntries.push(updated);
                } else {
                    console.warn(`⚠️ [toggleMultiple] No mapping found for lenderId: ${item.lenderId}, loanTypeId: ${item.loanTypeId}`);
                }

            } catch (error) {
                console.error(`❌ [toggleMultiple] Error updating mapping for lenderId: ${item.lenderId}, loanTypeId: ${item.loanTypeId}`, error);
            }
        }

        console.log("📦 [toggleMultiple] Final updated entries:", updatedEntries);
        return updatedEntries;
    },


    async getLendersForLoanType(loanTypeId: string) {
        const active = await LenderLoanMatrix.find({ loanTypeId, enabled: true })
            .populate("lenderId");

        return active.map(entry => entry.lenderId);
    },
};
