import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportInfo extends Document {
    email: {
        contact: string;
        timing: string;
    };
    phone: {
        contact: string;
        timing: string;
    };
    whatsapp: {
        contact: string;
        timing: string;
    };
    office: {
        contact: string;
        timing: string;
    };
    leadEmails: {
        pl: { to: string; cc: string };
        bl: { to: string; cc: string };
        sep: { to: string; cc: string };
    };
    grievance: {
        name: string;
        phone: string;
        email: string;
    };
    payout: {
        name: string;
        phone: string;
        email: string;
    };
}

const SupportInfoSchema = new Schema<ISupportInfo>({
    email: {
        contact: String,
        timing: String,
    },
    phone: {
        contact: String,
        timing: String,
    },
    whatsapp: {
        contact: String,
        timing: String,
    },
    office: {
        contact: String,
        timing: String,
    },
    leadEmails: {
        pl: { to: String, cc: String },
        bl: { to: String, cc: String },
        sep: { to: String, cc: String },
    },
    grievance: {
        name: String,
        phone: String,
        email: String,
    },
    payout: {
        name: String,
        phone: String,
        email: String,
    },
});

export const SupportInfoModel = mongoose.model<ISupportInfo>('SupportInfo', SupportInfoSchema);
