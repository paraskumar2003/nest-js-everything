export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    requestId?: string;
    timestamp: string;
    statusCode: number;
    path?: string;
}
