import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeline extends Document {
  leadId: string;
  applicantName: string;
  status: string;
  message: string;
  closeReason: string;
  rejectImage?: string;
  rejectReason?: string;
  rejectComment?: string;
  createdAt: Date;
}

const timelineSchema: Schema = new Schema<ITimeline>({
  leadId: { type: String, required: true },
  applicantName: { type: String, required: true },
  status: { type: String, required: true },
  message: { type: String, required: true },
  closeReason: { type: String, default: null },
  rejectImage: { type: String, default: null },
  rejectReason: { type: String, default: null },
  rejectComment: { type: String, default: null },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const Timeline = mongoose.model<ITimeline>('Timeline', timelineSchema);