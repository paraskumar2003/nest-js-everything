export interface S3MulterFile extends Express.Multer.File {
    key: string;
    location: string;
    bucket: string;
    etag: string;
}
