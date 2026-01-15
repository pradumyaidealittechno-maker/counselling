import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

let s3Client: S3Client | null = null;

const getS3Client = (): S3Client => {
  if (!s3Client) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
    }

    console.log('🔐 Initializing S3 Client');
    console.log('   Region:', region);
    console.log('   Access Key:', accessKeyId.substring(0, 4) + '...' + accessKeyId.substring(accessKeyId.length - 4));

    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3Client;
};

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

export const uploadToS3 = async (
  file: Buffer,
  folder: string,
  filename: string,
  contentType: string
): Promise<UploadResult> => {
  const client = getS3Client();
  const key = `${folder}/${uuidv4()}-${filename}`;
  const bucket = process.env.AWS_S3_BUCKET as string;

  if (!bucket) {
    throw new Error('AWS_S3_BUCKET not configured in .env file');
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await client.send(command);

  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { key, url, bucket };
};

export const getSignedDownloadUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  const client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: key,
  });

  await client.send(command);
};

export { getS3Client as s3Client };
