export function stripeBookingIdempotencyKey(paymentId: number, pendingReference: string): string {
  return `booking:${paymentId}:${pendingReference}`;
}

export function buildStripeBookingCheckoutForm(input: {
  origin: string;
  appointmentId: number;
  paymentId: number;
  amount: number;
  patientUserId: number;
}) {
  return new URLSearchParams({
    mode: "payment",
    success_url: `${input.origin}/billing/payment-result?kind=booking&provider=stripe&appointment_id=${input.appointmentId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/billing/payment-result?kind=booking&provider=stripe&appointment_id=${input.appointmentId}&cancelled=true`,
    client_reference_id: String(input.paymentId),
    "line_items[0][price_data][currency]": "egp",
    "line_items[0][price_data][product_data][name]": `Appointment #${input.appointmentId}`,
    "line_items[0][price_data][unit_amount]": String(Math.round(input.amount * 100)),
    "line_items[0][quantity]": "1",
    "metadata[payment_id]": String(input.paymentId),
    "metadata[appointment_id]": String(input.appointmentId),
    "metadata[patient_user_id]": String(input.patientUserId),
    "payment_intent_data[metadata][payment_id]": String(input.paymentId),
    "payment_intent_data[metadata][appointment_id]": String(input.appointmentId),
    "payment_intent_data[metadata][patient_user_id]": String(input.patientUserId),
  });
}