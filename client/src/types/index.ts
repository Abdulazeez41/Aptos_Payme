export interface PaymentRequest {
  payee: string;
  token: string;
  amount: number;
  memo: string;
  created_at: number;
  expires_at: number;
  paid: boolean;
  payer?: string;
}

export interface CreatePaymentRequestParams {
  token: string;
  amount: number;
  memo: string;
  expires_in_seconds: number;
}

export interface PaymentLink {
  id: string;
  url: string;
  qrCode: string;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  icon?: string;
}

export interface PaymentHistory {
  id: string;
  type: "sent" | "received";
  amount: number;
  token: TokenInfo;
  memo: string;
  date: Date;
  status: "pending" | "completed" | "expired" | "cancelled";
  counterparty: string;
  transactionHash?: string;
}

export interface ShareOptions {
  whatsapp: boolean;
  telegram: boolean;
  sms: boolean;
  email: boolean;
  copy: boolean;
}
