import path from 'path';
import { uploadToS3 } from '../services/upload.service';
import crypto from "crypto";
import { Counter } from '../model/Counter';

export const uploadFileToS3 = async (file: Express.Multer.File, folder: string) => {
    return await uploadToS3(file.buffer, path.basename(file.originalname), folder);
};

export const generateRandomPassword = () => {
    return crypto.randomBytes(8).toString('base64').slice(0, 10);
};

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateUniqueManagerId = async (): Promise<string> => {
    const result = await Counter.findByIdAndUpdate(
        { _id: 'managerID' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );

    const padded = String(result.seq).padStart(5, '0');
    return `MSM${padded}`;
};


export const generateUniquePartnerId = async (): Promise<string> => {
    const result = await Counter.findByIdAndUpdate(
        { _id: 'partnerId' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );

    const offsetSeq = 500 + (result.seq || 0); // add 500 offset
    const padded = String(offsetSeq).padStart(6, '0'); // Ensure 6 digits (e.g., 000501)
    return `MSC${padded}`;
};

export const generateUniqueLeadId = async (): Promise<string> => {
    const result = await Counter.findByIdAndUpdate(
        { _id: 'leadId' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );

    const padded = String(result.seq).padStart(5, '0');
    return `ML${padded}`;
};

export const generateUniqueAssociateId = async (partnerId: string): Promise<string> => {
    // Use a unique counter per partner
    const result = await Counter.findByIdAndUpdate(
        { _id: `associate-${partnerId}` },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
    );

    const padded = String(result.seq).padStart(3, '0'); // A001, A002, ...
    return `${partnerId}-A${padded}`;
};

export const unflattenObject = (flat: Record<string, any>): any => {
    const result: any = {};

    for (const key in flat) {
        const keys = key.split('.');
        keys.reduce((acc, curr, index) => {
            if (index === keys.length - 1) {
                acc[curr] = flat[key];
            } else {
                acc[curr] = acc[curr] || {};
            }
            return acc[curr];
        }, result);
    }

    return result;
}
