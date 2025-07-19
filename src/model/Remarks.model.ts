import mongoose, { Schema, Document } from 'mongoose';

interface IMessage {
  text: string;
  timestamp: Date;
}

interface IUserRemarks {
  userId: string;
  name: string;
  role: string;
  messages: IMessage[];
}

export interface IRemarks extends Document {
  leadId: string;
  applicantName: string;
  remarkMessage: IUserRemarks[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
},{ _id: false });

const userRemarksSchema = new Schema<IUserRemarks>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  messages: { type: [messageSchema], default: [] }
});

const remarksSchema: Schema = new Schema<IRemarks>({
  leadId: { type: String, required: true },
  remarkMessage: { type: [userRemarksSchema], default: [] }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const Remark = mongoose.model<IRemarks>('Remarks', remarksSchema);
