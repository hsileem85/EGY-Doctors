import { useEffect, useState, useCallback } from "react";
import { getAppointmentPaymentStatus, getBillingInfo } from "@/lib/api";
import { confirmStripeWalletTopUp } from "@/lib/financialApi";

type Status = "loading" | "success" | "confirming" | "failed";

export default function PaymentResult() {
  const [status, setStatus] = useState<Status>("loading");
  const [pollCount, setPollCount] = useState(0);

  const pollStatus = useCallback(async (attempt: number, orderId: string, appointmentId: number | null) => {
    try {
      const confirmed = appointmentId
        ? ["PAID", "SETTLED"].includes((await getAppointmentPaymentStatus(appointmentId)).status)
        : (await getBillingInfo()).status === "ACTIVE";
      if (confirmed) {
        setStatus("success");
        if (window.parent !== window) {
          window.parent.postMessage({ type: "PAYMOB_RESULT", success: true, orderId }, "*");
        }
        return;
      }
    } catch {
    }

    if (attempt < 8) {
      setPollCount(attempt + 1);
      setTimeout(() => pollStatus(attempt + 1, orderId, appointmentId), 2000);
    } else {
      setStatus("confirming");
    }
  }, []);

  const retryPoll = useCallback((orderId: string, appointmentId: number | null) => {
    setStatus("loading");
    setPollCount(0);
    pollStatus(0, orderId, appointmentId);
  }, [pollStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isStripeWalletTopUp = params.get("kind") === "wallet_top_up" && params.get("provider") === "stripe";
    const isStripeBooking = params.get("kind") === "booking" && params.get("provider") === "stripe";
    const stripeSessionId = params.get("session_id");
    if (isStripeWalletTopUp) {
      if (params.get("cancelled") === "true" || !stripeSessionId) {
        setStatus("failed");
        return;
      }
      void confirmStripeWalletTopUp(stripeSessionId)
        .then((result) => setStatus(result.status === "PAID" ? "success" : "confirming"))
        .catch(() => setStatus("failed"));
      return;
    }
    if (isStripeBooking) {
      const appointmentId = Number(params.get("appointment_id")) || null;
      if (params.get("cancelled") === "true" || !stripeSessionId || !appointmentId) {
        setStatus("failed");
        return;
      }
      const token = localStorage.getItem("egy_token");
      void fetch("/api/billing/stripe/appointments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ sessionId: stripeSessionId }),
      }).then(async response => {
        const result = await response.json().catch(() => ({}));
        setStatus(response.ok && result.status === "PAID" ? "success" : "failed");
      }).catch(() => setStatus("failed"));
      return;
    }

    const success = params.get("success") === "true";
    const orderId = params.get("order_id") ?? params.get("order") ?? "";
    const appointmentId = params.get("kind") === "booking"
      ? Number(params.get("appointment_id")) || null
      : null;

    if (success) {
      pollStatus(0, orderId, appointmentId);
    } else {
      setStatus("failed");
      if (window.parent !== window) {
        window.parent.postMessage({ type: "PAYMOB_RESULT", success: false, orderId }, "*");
      }
    }
  }, [pollStatus]);

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const orderId = params.get("order_id") ?? params.get("order") ?? "";
  const appointmentId = params.get("kind") === "booking"
    ? Number(params.get("appointment_id")) || null
    : null;
  const isBooking = appointmentId !== null;
  const isWalletTopUp = params.get("kind") === "wallet_top_up";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Confirming your payment…</p>
            <p className="text-sm text-gray-400 mt-1">
              {pollCount > 0 ? `Attempt ${pollCount} of 8…` : "This may take a few seconds."}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <p className="text-gray-900 font-semibold text-lg">Payment Successful</p>
            <p className="text-sm text-gray-500 mt-1">
               {isWalletTopUp
                 ? "Your wallet balance has been updated."
                 : isBooking
                   ? "Your appointment payment is confirmed."
                   : "Your subscription is now active."}
            </p>
             {isWalletTopUp && (
               <button
                 onClick={() => window.location.assign("/dashboard?tab=wallet")}
                 className="mt-5 px-4 py-2 bg-[#D4A853] text-white text-sm font-medium rounded-lg hover:bg-[#b8913f] transition-colors"
               >
                 Return to Wallet
               </button>
             )}
          </>
        )}

        {status === "confirming" && (
          <>
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⏳</div>
            <p className="text-gray-900 font-semibold text-lg">Payment Received</p>
            <p className="text-sm text-gray-500 mt-2">
               Your payment was received but {isWalletTopUp ? "wallet confirmation" : isBooking ? "booking confirmation" : "subscription activation"} is taking longer than expected.
              Please check your dashboard in a moment.
            </p>
            <button
              onClick={() => retryPoll(orderId, appointmentId)}
              className="mt-4 px-4 py-2 bg-[#D4A853] text-white text-sm font-medium rounded-lg hover:bg-[#b8913f] transition-colors"
            >
              Check Status Again
            </button>
            {window.parent !== window && (
              <button
                onClick={() => window.parent.postMessage({ type: "PAYMOB_RESULT", success: false, orderId }, "*")}
                className="block mt-2 text-xs text-gray-400 hover:text-gray-600 mx-auto"
              >
                Return to dashboard
              </button>
            )}
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✕</div>
            <p className="text-gray-900 font-semibold text-lg">Payment Not Completed</p>
            <p className="text-sm text-gray-500 mt-1">
               {isWalletTopUp
                 ? "Your wallet top-up was not completed."
                 : isBooking
                   ? "Your appointment payment was not completed."
                   : "Your subscription was not activated."} Please try again.
            </p>
             {isWalletTopUp && (
               <button
                 onClick={() => window.location.assign("/dashboard?tab=wallet")}
                 className="mt-5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
               >
                 Return to Wallet
               </button>
             )}
            {window.parent !== window && (
              <button
                onClick={() => window.parent.postMessage({ type: "PAYMOB_RESULT", success: false, orderId }, "*")}
                className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Return to dashboard
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
