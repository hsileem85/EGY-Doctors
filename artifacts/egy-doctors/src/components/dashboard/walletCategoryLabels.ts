export const walletCategoryLabels = {
  BOOKING_PAYMENT: { en: "Booking Payment", ar: "دفع حجز" },
  PLATFORM_COMMISSION: { en: "Platform Commission", ar: "عمولة المنصة" },
  SUBSCRIPTION_FEE: { en: "Subscription Fee", ar: "رسوم اشتراك" },
  WITHDRAWAL_PAYOUT: { en: "Withdrawal Payout", ar: "سحب أموال" },
  REFUND: { en: "Refund", ar: "استرداد نقدي" },
  CASHBACK_REWARD: { en: "Cashback Reward", ar: "مكافأة كاش باك" },
  WALLET_TOP_UP: { en: "Wallet Top-Up", ar: "شحن المحفظة" },
  CASHBACK_USAGE: { en: "Cashback Used", ar: "استخدام الكاش باك" },
  FEE_DEDUCTION: { en: "Fee Deduction", ar: "خصم رسوم" },
  ADMIN_GIFT: { en: "Admin Gift", ar: "هدية من الإدارة" },
} as const;

export function getWalletCategoryLabel(category: string, isRTL: boolean) {
  const label = walletCategoryLabels[category as keyof typeof walletCategoryLabels];
  if (label) return isRTL ? label.ar : label.en;

  return category
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}