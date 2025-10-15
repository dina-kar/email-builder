import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'email-templates-assets';

    const endpoint = this.configService.get<string>('AWS_ENDPOINT') || 'http://localhost:4566';
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    const forcePathStyle =
      this.configService.get<string>('AWS_S3_FORCE_PATH_STYLE') === 'true';

    this.s3Client = new S3Client({
      region: region,
      endpoint: endpoint,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'test',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'test',
      },
      forcePathStyle: forcePathStyle,
    });

    this.logger.log(
      `S3 Service initialized with bucket: ${this.bucketName}, endpoint: ${endpoint}`,
    );
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'assets',
  ): Promise<{ key: string; url: string }> {
    const fileExtension = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      const url = this.getPublicUrl(key);
      this.logger.log(`File uploaded successfully: ${key}`);

      return { key, url };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload base64 image to S3
   */
  async uploadBase64Image(
    base64Data: string,
    folder: string = 'images',
  ): Promise<{ key: string; url: string }> {
    try {
      // Extract mime type and data from base64 string
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const extension = mimeType.split('/')[1];
      const key = `${folder}/${uuidv4()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      const url = this.getPublicUrl(key);
      this.logger.log(`Base64 image uploaded successfully: ${key}`);

      return { key, url };
    } catch (error) {
      this.logger.error(
        `Failed to upload base64 image: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get a signed URL for private access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.deleteFile(key)));
      this.logger.log(`Deleted ${keys.length} files successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to delete files: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder: string = ''): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: folder,
      });

      const response = await this.s3Client.send(command);
      const keys = response.Contents?.map((item) => item.Key).filter((key): key is string => key !== undefined) || [];

      this.logger.log(`Listed ${keys.length} files in folder: ${folder}`);
      return keys;
    } catch (error) {
      this.logger.error(
        `Failed to list files: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    const endpoint = this.configService.get<string>('AWS_ENDPOINT');
    return `${endpoint}/${this.bucketName}/${key}`;
  }
}
