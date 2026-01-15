import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

export class S3Service {
  private bucket: string;

  constructor() {
    this.bucket = config.aws.s3Bucket;
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Buffer,
    folder: string,
    fileName: string,
    contentType: string
  ): Promise<UploadResult> {
    const key = `${folder}/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Generate pre-signed URL for secure access (valid for 7 days)
    const url = await this.getSignedUrl(key, 7 * 24 * 60 * 60);


    return {
      key,
      url,
      bucket: this.bucket,
    };
  }

  /**
   * Upload interview recording
   */
  async uploadRecording(
    file: Buffer,
    candidateId: string,
    fileName: string
  ): Promise<UploadResult> {
    const folder = `${config.aws.s3Folders.recordings}/${candidateId}`;
    return this.uploadFile(file, folder, fileName, 'video/webm');
  }

  /**
   * Upload resume
   */
  async uploadResume(
    file: Buffer,
    candidateId: string,
    fileName: string,
    contentType: string
  ): Promise<UploadResult> {
    const folder = `${config.aws.s3Folders.resumes}/${candidateId}`;
    return this.uploadFile(file, folder, fileName, contentType);
  }

  /**
   * Upload job description
   */
  async uploadJobDescription(
    file: Buffer,
    jobId: string,
    fileName: string,
    contentType: string
  ): Promise<UploadResult> {
    const folder = `${config.aws.s3Folders.jobDescriptions}/${jobId}`;
    return this.uploadFile(file, folder, fileName, contentType);
  }

  /**
   * Get a signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Generate a presigned URL for direct upload from client
   */
  async getPresignedUploadUrl(
    folder: string,
    fileName: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const key = `${folder}/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    // Generate pre-signed URL for viewing (7 days expiry)
    const publicUrl = await this.getSignedUrl(key, 7 * 24 * 60 * 60);


    return {
      uploadUrl,
      key,
      publicUrl,
    };
  }
}

export const s3Service = new S3Service();
