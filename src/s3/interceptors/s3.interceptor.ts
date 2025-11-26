// src/common/interceptors/s3-multiple-fields.interceptor.ts

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multerS3 from 'multer-s3';
import * as multer from 'multer';
import { v4 as uuid } from 'uuid';
import { S3Service } from '../s3.service';
import { NestInterceptor, Type, mixin } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

export function S3MultipleFieldsInterceptor(
    fields: { name: string; maxCount: number }[],
): Type<NestInterceptor> {
    const s3Client = new S3Service().getS3Client();

    return mixin(
        FileFieldsInterceptor(fields, {
            storage: multerS3({
                s3: s3Client,
                bucket: process.env.AWS_S3_BUCKET_NAME,
                acl: 'public-read',
                key: (req, file, cb) => {
                    const ext = file.originalname.split('.').pop();
                    const filename = `${uuid()}.${ext}`;
                    cb(
                        null,
                        `devyani+${process.env.NODE_ENV}/app/upload/${filename}`,
                    );
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith('image/')) {
                    return cb(
                        new multer.MulterError(
                            'LIMIT_UNEXPECTED_FILE',
                            'Only image files are allowed!',
                        ),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    );
}
