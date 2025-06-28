import { Lender } from "../../model/lender.model";
import { LoanType } from "../../model/loan.model";
import { Offer } from "../../model/offer.model";
import { uploadFileToS3 } from "../../utils/helper";

export const offerService = {
  async createOffer(data: any, files: any) {

    console.log("data", data)
    let s3url;
    if (files.bankImage?.[0]) {
      s3url = await uploadFileToS3(files.bankImage?.[0], 'bankImage');
      data.bankImage = s3url;
    }
    return await Offer.create(data);
  },

  async getAllOffers() {
    return await Offer.find({ isDeleted: false }).sort({createdAt: -1});
  },

  async getOfferById(id: string) {
    return await Offer.findById(id);
  },

  async updateOffer(id: string, updates: any, files: any) {
    let s3url;
    if (files.bankImage?.[0]) {
      s3url = await uploadFileToS3(files.bankImage?.[0], 'bankImage');
      updates.bankImage = s3url;
    }
    return await Offer.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteOffer(id: string) {
    return await Offer.findByIdAndUpdate(id, { isDeleted: true });
  },

  async createLoanTypes(name: string) {
    return await LoanType.create({ name });
  },

  async getLoanTypes() {
    return await LoanType.find();
  },

  async createLender(name: string) {
    return await Lender.create({name});
  },
  async getLenders() {
    return await Lender.find();
  },
};