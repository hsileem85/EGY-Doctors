import { useEffect, useState, useCallback } from "react";
import { getBillingInfo } from "@/lib/api";

type Status = "loading" | "success" | "confirming" | "failed";

export default function PaymentResult() {
  const [status, setStatus] = useState<Status>("loading");
  const [pollCount, setPollCount] = useState(0);

  const pollStatus = useCallback(async (attempt: number, orderId: string) => {
    try {
      const info = await getBillingInfo();
      if (info.status === "ACTIVE") {
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
      setTimeout(() => pollStatus(attempt + 1, orderId), 2000);
    } else {
      setStatus("confirming");
    }
  }, []);

  const retryPoll = useCallback((orderId: string) => {
    setStatus("loading");
    setPollCount(0);
    pollStatus(0, orderId);
  }, [pollStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success") === "true";
    const orderId = params.get("order_id") ?? params.get("order") ?? "";

    if (success) {
      pollStatus(0, orderId);
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
            <p className="text-sm text-gray-500 mt-1">Your subscription is now active.</p>
          </>
        )}

        {status === "confirming" && (
          <>
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⏳</div>
            <p className="text-gray-900 font-semibold text-lg">Payment Received</p>
            <p className="text-sm text-gray-500 mt-2">
              Your payment was received but subscription activation is taking longer than expected. 
              Please check your dashboard in a moment.
            </p>
            <button
              onClick={() => retryPoll(orderId)}
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
            <p className="text-sm text-gray-500 mt-1">Your subscription was not activated. Please try again.</p>
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
