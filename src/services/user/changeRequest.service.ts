import { ChangeRequestModel } from "../../model/ChangeRequest.model";
import { CombinedUser } from "../../model/user/user.model";
import { uploadFileToS3 } from "../../utils/helper";


export const changeRequestService = {
    async createRequest(
        userId: string,
        requestType: string,
        previousData: any,
        currentData: any,
        reason: string,
        files: { [fieldname: string]: Express.Multer.File[] }
    ) {
        const documentKeys = [
            'profilePhoto',
            'panCard',
            'aadharFront',
            'aadharBack',
            'cancelledCheque',
            'gstCertificate',
            'aditional',
        ];

        let parsedCurrentData = { ...currentData };

        if (requestType === "documents") {
            const currentDocs: { [key: string]: string | string[] } = {};

            for (const key of documentKeys) {
                const fileArray = files[key];

                if (fileArray && fileArray.length > 0) {
                    if (key === 'aditional') {
                        const urls: string[] = [];
                        for (const file of fileArray) {
                            const url = await uploadFileToS3(file, 'partners');
                            urls.push(url);
                        }
                        currentDocs[key] = urls;
                    } else {
                        const file = fileArray[0];
                        const url = await uploadFileToS3(file, 'partners');
                        currentDocs[key] = url;
                    }
                }
            }

            parsedCurrentData = currentDocs;
        }

        const request = await ChangeRequestModel.create({
            userId,
            requestType,
            previousData,
            currentData: parsedCurrentData,
            reason,
            status: "pending",
        });

        return request;
    },


    async getPendingRequestsForAdmin(partnerId: string) {
        return ChangeRequestModel.find({ userId: partnerId, status: "pending" }).populate("userId", "firstName lastName email");
    },

    async getAllRequestsForPartner(userId: string) {
        return ChangeRequestModel.find({ userId }).sort({ createdAt: -1 });
    },

    async updateStatus(requestId: string, status: "approved" | "rejected", message: string) {
        console.log(`🔁 updateStatus called with:`);
        console.log(`   - requestId: ${requestId}`);
        console.log(`   - status: ${status}`);
        console.log(`   - message: ${message}`);

        const request = await ChangeRequestModel.findById(requestId);
        if (!request) {
            console.error(`❌ No request found with ID: ${requestId}`);
            throw new Error("Request not found");
        }

        console.log(`✅ Found request:`, {
            id: request._id,
            userId: request.userId,
            status: request.status,
            requestType: request.requestType,
            currentData: request.currentData,
        });

        request.status = status;

        if (status === "approved") {
            console.log(`🟢 Status is 'approved'. Setting approveMessage and updating user data.`);

            request.approveMessage = message;

            if (request.requestType === "documents" && request.currentData.aditional) {
                if (Array.isArray(request.currentData.aditional)) {
                    request.currentData.aditional = request.currentData.aditional[0];
                }
            }


            let updateField = {};

            if (request.requestType === "bankDetails") {
                updateField = { bankDetails: request.currentData };
            } else if (request.requestType === "documents") {
                const user = await CombinedUser.findById(request.userId);
                if (!user) throw new Error("User not found");

                const mergedDocuments = {
                    ...(user.documents || {}),
                    ...request.currentData
                };

                updateField = { documents: mergedDocuments };

                console.log("📦 Merging user.documents with request.currentData:");
                console.log(JSON.stringify(mergedDocuments, null, 2));
            }

            await CombinedUser.findByIdAndUpdate(request.userId, updateField);
        } else {
            console.log(`🔴 Status is 'rejected'. Setting rejectMessage.`);
            request.rejectMessage = message;
        }

        await request.save();
        console.log(`💾 Request status updated and saved successfully`);

        return request;
    }

};
