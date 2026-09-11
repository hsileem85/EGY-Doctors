const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("egy_token");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}

export interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber?: string | null;
  iban?: string | null;
}

export interface PaymobTopUp {
  iframeUrl: string;
  paymentKey: string;
  iframeId: string;
  orderId: string;
  paymentId: number;
}

export interface WithdrawalRequest {
  id: string;
  doctorUserId: string;
  amount: number;
  bankAccountId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A doctor without saved details is an expected first-use state (404). */
export async function getBankAccount(): Promise<BankAccount | null> {
  try {
    return await request<BankAccount>("/wallet/bank-account");
  } catch (error) {
    if (error instanceof Error && error.message === "Bank account not found") return null;
    throw error;
  }
}
export const updateBankAccount = (account: {
  accountHolderName: string;
  bankName: string;
  accountNumber: string | null;
  iban: string | null;
}) => request<BankAccount>("/wallet/bank-account", {
  method: "PUT",
  body: JSON.stringify(account),
});
export const requestWalletWithdrawal = (amount: number) =>
  request<WithdrawalRequest>("/wallet/withdrawals", { method: "POST", body: JSON.stringify({ amount }) });
export const initiateWalletTopUp = (amount: number, paymentMethod: "card" | "fawry" | "wallet" = "card") =>
  request<PaymobTopUp>("/wallet/top-ups", {
    method: "POST",
    body: JSON.stringify({ amount, paymentMethod }),
  });