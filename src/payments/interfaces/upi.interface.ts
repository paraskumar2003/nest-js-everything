export interface UpiResponse {
  success: boolean;
  upiId: string;
  message?: string;
}

export interface PaymentProcessResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}