import { and, eq } from "drizzle-orm";
import { db, paymentsTable } from "@workspace/db";

const PAYMOB_BASE = "https://accept.paymob.com/api";

export async function requestPaymobRefund(input: {
  transactionId: string;
  amount: number;
}): Promise<void> {
  const apiKey = process.env.PAYMOB_API_KEY;
  if (!apiKey) throw new Error("Paymob API key is not configured");

  const authResponse = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!authResponse.ok) throw new Error(`Paymob auth failed: ${authResponse.status}`);
  const { token } = await authResponse.json() as { token: string };

  const refundResponse = await fetch(`${PAYMOB_BASE}/acceptance/void_refund/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: token,
      transaction_id: Number(input.transactionId),
      amount_cents: Math.round(input.amount * 100),
    }),
  });
  if (!refundResponse.ok) throw new Error(`Paymob refund failed: ${refundResponse.status}`);
}

export async function dispatchPaymobRefund(paymentId: number): Promise<boolean> {
  const [claimed] = await db.update(paymentsTable)
    .set({ status: "REFUND_REQUESTED" })
    .where(and(
      eq(paymentsTable.id, paymentId),
      eq(paymentsTable.status, "REFUND_PENDING"),
    ))
    .returning();
  if (!claimed) return false;
  if (!claimed.paymobTransactionId) {
    await db.update(paymentsTable)
      .set({ status: "REFUND_PENDING" })
      .where(eq(paymentsTable.id, claimed.id));
    throw new Error("Paid booking is missing its gateway transaction ID");
  }
  try {
    await requestPaymobRefund({
      transactionId: claimed.paymobTransactionId,
      amount: claimed.amount,
    });
    return true;
  } catch (error) {
    await db.update(paymentsTable)
      .set({ status: "REFUND_PENDING" })
      .where(and(
        eq(paymentsTable.id, claimed.id),
        eq(paymentsTable.status, "REFUND_REQUESTED"),
      ));
    throw error;
  }
}