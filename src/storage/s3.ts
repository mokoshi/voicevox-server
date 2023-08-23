import AWS from "aws-sdk";
import { Stream } from "node:stream";

AWS.config.update({ region: "ap-northeast-1" });

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const S3_BUCKET = process.env.S3_BUCKET;

export const S3Storage = {
  createWriteStream(path: string) {
    const stream = new Stream.PassThrough();
    s3.upload({
      Bucket: S3_BUCKET,
      Key: path,
      Body: stream,
    }).promise();
    return stream;
  },

  async writeAsync(path: string, data: Buffer) {
    return await s3
      .upload({
        Bucket: S3_BUCKET,
        Key: path,
        Body: data,
      })
      .promise();
  },

  async getObjectUrl(path: string) {
    return await s3.getSignedUrlPromise("getObject", {
      Bucket: S3_BUCKET,
      Key: path,
    });
  },
};
