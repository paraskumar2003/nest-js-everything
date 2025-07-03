export class VerifyOtpResponseDto {
    success: boolean;
    message: string;
    data: {
        access_token: string | null;
        verified: boolean;
    };
}
