export type AppointmentPaymentMethod = "CASH" | "CARD" | "WALLET";

export interface AppointmentPaymentParams {
  paymentMethod: AppointmentPaymentMethod;
  useCashback: boolean;
}

/**
 * Appointment payment endpoint is not currently represented in the generated
 * client. Keep this small wrapper here until the API contract is generated.
 */
export async function submitAppointmentPayment(
  appointmentId: number,
  params: AppointmentPaymentParams,
): Promise<{ iframeUrl?: string; paymentKey?: string; [key: string]: unknown }> {
  const token = localStorage.getItem("egy_token");
  const response = await fetch(`/api/appointments/${appointmentId}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${response.status}`);
  }
  return data;
}