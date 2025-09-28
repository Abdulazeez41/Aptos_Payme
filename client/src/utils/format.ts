export const formatAmount = (amount: number, decimals: number): string => {
  const divisor = Math.pow(10, decimals);
  const formatted = (amount / divisor).toFixed(decimals);
  // Remove trailing zeros
  return parseFloat(formatted).toString();
};

export const parseAmount = (amount: string, decimals: number): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.floor(parseFloat(amount) * multiplier);
};

export const formatAddress = (
  address: string,
  startChars = 6,
  endChars = 4
): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(timestamp);
};

export const isExpired = (expiresAt: number): boolean => {
  return Date.now() / 1000 > expiresAt;
};

export const getTimeRemaining = (expiresAt: number): string => {
  const now = Date.now() / 1000;
  const remaining = expiresAt - now;

  if (remaining <= 0) return "Expired";

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const generatePaymentUrl = (
  requestId: string,
  amount?: string,
  token?: string,
  memo?: string,
  payee?: string,
  expiresAt?: number
): string => {
  const baseUrl = window.location.origin;
  const url = new URL(`${baseUrl}/pay/${requestId}`);

  // Add request parameters as URL search params
  if (amount) url.searchParams.set("amount", amount);
  if (token) url.searchParams.set("token", token);
  if (memo) url.searchParams.set("memo", memo);
  if (payee) url.searchParams.set("payee", payee);
  if (expiresAt) url.searchParams.set("expires_at", expiresAt.toString());

  return url.toString();
};

export const generateShareText = (
  amount: string,
  token: string,
  memo: string,
  url: string
): string => {
  return ` Payment Request: ${amount} ${token}\n ${memo}\n\n Pay here: ${url}`;
};

export const generateWhatsAppUrl = (text: string): string => {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

export const generateTelegramUrl = (text: string): string => {
  return `https://t.me/share/url?text=${encodeURIComponent(text)}`;
};

export const generateSMSUrl = (text: string): string => {
  return `sms:?body=${encodeURIComponent(text)}`;
};

export const generateEmailUrl = (subject: string, body: string): string => {
  return `mailto:?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
};
