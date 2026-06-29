import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getBillingInfo } from "@/lib/api";

export default function PaymentResult() {
  const [location] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success") === "true";
    const orderId = params.get("order_id") ?? params.get("order") ?? "";

    if (success) {
      let polls = 0;
      const maxPolls = 8;

      async function pollStatus() {
        polls++;
        try {
          const info = await getBillingInfo();
          if (info.status === "ACTIVE") {
            setStatus("success");
            setMessage("Payment successful! Your subscription is now active.");
            if (window.parent !== window) {
              window.parent.postMessage({ type: "PAYMOB_RESULT", success: true, orderId }, "*");
            }
            return;
          }
        } catch {
        }

        if (polls < maxPolls) {
          setTimeout(pollStatus, 2000);
        } else {
          setStatus("success");
          setMessage("Payment received. Your subscription will activate shortly.");
          if (window.parent !== window) {
            window.parent.postMessage({ type: "PAYMOB_RESULT", success: true, orderId }, "*");
          }
        }
      }

      pollStatus();
    } else {
      setStatus("failed");
      setMessage("Payment was not completed.");
      if (window.parent !== window) {
        window.parent.postMessage({ type: "PAYMOB_RESULT", success: false, orderId }, "*");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Confirming your payment…</p>
            <p className="text-sm text-gray-400 mt-1">This may take a few seconds.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <p className="text-gray-900 font-semibold text-lg">Payment Successful</p>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✕</div>
            <p className="text-gray-900 font-semibold text-lg">Payment Not Completed</p>
            <p className="text-sm text-gray-500 mt-1">Your subscription was not activated. Please try again.</p>
          </>
        )}
      </div>
    </div>
  );
}
