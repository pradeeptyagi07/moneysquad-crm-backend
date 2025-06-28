"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromS3 = exports.uploadToS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const mime_types_1 = __importDefault(require("mime-types"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new aws_sdk_1.default.S3();
const uploadToS3 = (file, filename, folder) => {
    const contentType = mime_types_1.default.contentType(filename) || 'application/octet-stream';
    const params = {
        Bucket: process.env.AWS_BUCKETNAME || '',
        Key: folder ? `${folder}/${filename}` : filename,
        Body: file instanceof Buffer ? file : file.buffer,
        ContentType: contentType,
    };
    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err);
                reject(err);
            }
            else {
                console.log('File uploaded successfully:', data.Location);
                resolve(data.Location);
            }
        });
    });
};
exports.uploadToS3 = uploadToS3;
const deleteFileFromS3 = async (fileUrl) => {
    const bucketName = process.env.AWS_BUCKETNAME || '';
    // Extract the file key from the URL (assuming public URL format)
    const key = fileUrl.split(`${bucketName}/`)[1];
    if (!key)
        return; // If key extraction fails, do nothing
    const params = {
        Bucket: bucketName,
        Key: key,
    };
    return new Promise((resolve, reject) => {
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.error("Error deleting file from S3:", err);
                reject(err);
            }
            else {
                console.log("File deleted successfully from S3:", key);
                resolve(data);
            }
        });
    });
};
exports.deleteFileFromS3 = deleteFileFromS3;
