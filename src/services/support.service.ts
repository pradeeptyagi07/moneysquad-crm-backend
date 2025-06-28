import { SupportInfoModel } from "../model/SupportInfo.model";

export const supportService = {
  async getSupportInfo() {
    let info = await SupportInfoModel.findOne();
    if (!info) {
      throw new Error("Support info not set.");
    }
    return info;
  },

  async updateSupportInfo(data: any) {
    let info = await SupportInfoModel.findOne();
    if (!info) {
      // create if not exists
      info = await SupportInfoModel.create(data);
    } else {
      Object.assign(info, data);
      await info.save();
    }
    return info;
  }
};