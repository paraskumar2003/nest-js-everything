import {
    BadRequestException,
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { S3MulterFile } from './interfaces/s3.interface';
import { S3MultipleFieldsInterceptor } from './interceptors/s3.interceptor';

@Controller('s3')
export class S3Controller {
    @Post('upload')
    @UseInterceptors(
        S3MultipleFieldsInterceptor([{ name: 'image', maxCount: 1 }]),
    )
    async uploadSingleImage(
        @UploadedFiles()
        files: {
            image?: S3MulterFile[];
        },
    ): Promise<{ url: string }> {
        const uploaded = files?.image?.[0];
        if (!uploaded || !uploaded.location) {
            throw new BadRequestException('Image file is required');
        }

        return {
            url: uploaded.location,
        };
    }
}
