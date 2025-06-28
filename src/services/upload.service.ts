import AWS from 'aws-sdk';
import mime from 'mime-types';
import dotenv from "dotenv";

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});


const s3 = new AWS.S3();

export const uploadToS3 = (
    file: Express.Multer.File | Buffer,
    filename: string,
    folder?: string
): Promise<string> => {
    const contentType = mime.contentType(filename) || 'application/octet-stream';

    const params: AWS.S3.PutObjectRequest = {
        Bucket:  process.env.AWS_BUCKETNAME || '',
        Key: folder ? `${folder}/${filename}` : filename,
        Body: file instanceof Buffer ? file : file.buffer,
        ContentType: contentType,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
            if (err) {
                console.error('Error uploading file:', err);
                reject(err);
            } else {
                console.log('File uploaded successfully:', data.Location);
                resolve(data.Location);
            }
        });
    });
};


export const deleteFileFromS3 = async (fileUrl: string) => {
    const bucketName = process.env.AWS_BUCKETNAME || '';

    // Extract the file key from the URL (assuming public URL format)
    const key = fileUrl.split(`${bucketName}/`)[1]; 

    if (!key) return; // If key extraction fails, do nothing

    const params: AWS.S3.DeleteObjectRequest = {
        Bucket: bucketName,
        Key: key,
    };

    return new Promise((resolve, reject) => {
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.error("Error deleting file from S3:", err);
                reject(err);
            } else {
                console.log("File deleted successfully from S3:", key);
                resolve(data);
            }
        });
    });
};
