import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class S3Service {
    private readonly s3: S3Client;

    constructor() {
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        if (!accessKeyId || !secretAccessKey) {
            throw new Error(
                'Missing AWS credentials. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env',
            );
        }

        this.s3 = new S3Client({
            region: 'ap-south-1',
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    getS3Client(): S3Client {
        return this.s3;
    }
}
