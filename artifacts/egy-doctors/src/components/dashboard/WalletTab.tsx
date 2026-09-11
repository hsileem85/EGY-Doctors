import { useGetWallet } from "@workspace/api-client-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getBankAccount, initiateWalletTopUp, requestWalletWithdrawal } from "@/lib/financialApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, CheckCircle2, History, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { arEG, enGB } from "date-fns/locale";
import { getWalletCategoryLabel } from "./walletCategoryLabels";

interface WalletTabProps {
  isRTL: boolean;
  ownerMode?: "doctor" | "patient" | "medical-center" | "platform";
}

export function WalletTab({ isRTL, ownerMode = "patient" }: WalletTabProps) {
  const isDoctor = ownerMode === "doctor";
  const isPlatform = ownerMode === "platform";
  const queryClient = useQueryClient();
  const { data: wallet, isLoading, isError, refetch } = useGetWallet();
  const { data: bankAccount } = useQuery({ queryKey: ["bank-account"], queryFn: getBankAccount, enabled: isDoctor });
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const withdrawal = useMutation({
    mutationFn: () => requestWalletWithdrawal(Number(amount)),
    onSuccess: () => {
      setMessage({ text: isRTL ? "تم إرسال طلب السحب وهو قيد المراجعة." : "Withdrawal request submitted and is pending review." });
      setAmount("");
      setWithdrawOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
    },
    onError: (error: Error) => setMessage({ text: error.message, error: true }),
  });
  const topUp = useMutation({
    mutationFn: () => initiateWalletTopUp(Number(amount)),
    onSuccess: (result) => {
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      else setMessage({ text: isRTL ? "تعذر بدء الدفع." : "Payment could not be started.", error: true });
    },
    onError: (error: Error) => setMessage({ text: error.message, error: true }),
  });
  const parsedAmount = Number(amount);
  const withdrawalError = !bankAccount
    ? (isRTL ? "أضف بيانات حسابك البنكي أولاً." : "Save your bank account details first.")
    : !Number.isFinite(parsedAmount) || parsedAmount <= 0
      ? (isRTL ? "أدخل مبلغاً موجباً." : "Enter a positive amount.")
      : parsedAmount > (wallet?.balance ?? 0)
        ? (isRTL ? "المبلغ يتجاوز الرصيد المتاح." : "Amount exceeds your available balance.")
        : null;
  const topUpError = !Number.isFinite(parsedAmount) || parsedAmount < 50
    ? (isRTL ? "الحد الأدنى للشحن هو 50 جنيهاً." : "Minimum top-up is 50 EGP.")
    : null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(isRTL ? "ar-EG" : "en-EG", {
      style: "currency",
      currency: currency || "EGP",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <RefreshCw className="h-10 w-10 text-[#D4A853] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">{isRTL ? "جاري تحميل المحفظة..." : "Loading wallet..."}</p>
      </div>
    );
  }

  if (isError || !wallet) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {isRTL ? "تعذر تحميل المحفظة" : "Could not load wallet"}
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm">
          {isRTL 
            ? "حدث خطأ أثناء جلب بيانات المحفظة. يرجى المحاولة مرة أخرى." 
            : "An error occurred while fetching your wallet data. Please try again."}
        </p>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isRTL ? "إعادة المحاولة" : "Try Again"}
        </button>
      </div>
    );
  }

  const currency = wallet.currency || "EGP";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-[#D4A853]" />
          {isPlatform
            ? (isRTL ? "محفظة المنصة" : "Platform Wallet")
            : (isRTL ? "محفظتي" : "My Wallet")}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isPlatform
            ? (isRTL
                ? "عرض رصيد المنصة والأموال المعلقة وسجل المعاملات."
                : "View the platform balance, pending funds, and transaction history.")
            : (isRTL
                ? "تتبع الأرصدة المتاحة والأموال المعلقة وسجل معاملاتك."
                : "Track your available balance, pending funds, and transaction history.")}
        </p>
      </div>
      {isDoctor && wallet.balance <= 50 && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">
                {isRTL ? "رصيد المحفظة منخفض" : "Low wallet balance"}
              </p>
              <p className="mt-1 text-sm">
                {isRTL
                  ? "يجب أن يكون رصيدك المتاح 50 جنيهاً على الأقل حتى يظهر ملفك للمرضى. اشحن محفظتك الآن للحفاظ على ظهور حسابك."
                  : "Your available balance must be at least 50 EGP for your profile to appear to patients. Top up now to keep your account visible."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Available Balance */}
        <Card className="border-0 shadow-sm shadow-gray-200/60 overflow-hidden relative hover-elevate transition-all group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            <CheckCircle2 className="w-32 h-32 text-green-600 transform translate-x-4 -translate-y-8" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {isRTL ? "الرصيد المتاح" : "Available Balance"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(wallet.balance, currency)}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {isPlatform
                ? (isRTL ? "الرصيد المتاح للمنصة" : "Available platform balance")
                : (isRTL ? "متاح للسحب والاستخدام" : "Available for withdrawal and use")}
            </p>
          </CardContent>
        </Card>

        {/* Pending Funds */}
        <Card className="border-0 shadow-sm shadow-gray-200/60 overflow-hidden relative hover-elevate transition-all group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            <Clock className="w-32 h-32 text-amber-600 transform translate-x-4 -translate-y-8" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {isRTL ? "الأموال المعلقة" : "Pending Funds"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(wallet.pendingFunds, currency)}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {isRTL ? "تُضاف للرصيد بعد استكمال المواعيد" : "Added to balance upon appointment completion"}
            </p>
          </CardContent>
        </Card>

        {/* Total Equity */}
        <Card className="border-0 shadow-sm shadow-gray-200/60 overflow-hidden relative hover-elevate transition-all group md:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#D4A853]/5 to-transparent">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            <Wallet className="w-32 h-32 text-[#D4A853] transform translate-x-4 -translate-y-8" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#D4A853] flex items-center gap-2">
              {isRTL ? "إجمالي الأموال" : "Total Equity"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#D4A853] tracking-tight">
              {formatCurrency(wallet.balance + wallet.pendingFunds, currency)}
            </div>
            <p className="text-xs text-[#D4A853]/70 mt-2">
              {isRTL ? "المتاح والمعلق معاً" : "Available and pending combined"}
            </p>
          </CardContent>
        </Card>
      </div>
      {isDoctor && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button onClick={() => { setMessage(null); setAmount(""); setWithdrawOpen(true); }} className="bg-[#D4A853] text-[#0F172A]">
            {isRTL ? "طلب سحب" : "Request Withdrawal"}
          </Button>
          <Button variant="outline" onClick={() => { setMessage(null); setAmount(""); setTopUpOpen(true); }}>
            {isRTL ? "شحن الرصيد" : "Top Up Balance"}
          </Button>
          {message && <p className={`text-sm ${message.error ? "text-red-600" : "text-green-600"}`}>{message.text}</p>}
        </div>
      )}

      <Card className="border-0 shadow-sm shadow-gray-200/60 overflow-hidden">
        <CardHeader className="border-b bg-gray-50/50 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-5 w-5 text-gray-400" />
            {isRTL ? "سجل المعاملات" : "Transaction History"}
            <span className="text-gray-400 font-normal text-sm ms-auto">
              {wallet.transactions.length > 0 ? wallet.transactions.length : 0} {isRTL ? "معاملة" : "transactions"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{isRTL ? "المعاملة" : "Transaction"}</TableHead>
                <TableHead>{isRTL ? "المبلغ" : "Amount"}</TableHead>
                <TableHead className="hidden md:table-cell">{isRTL ? "الرصيد بعد" : "Balance Post"}</TableHead>
                <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallet.transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <History className="h-8 w-8 text-gray-300" />
                      </div>
                      <p>{isRTL ? "لا توجد معاملات بعد" : "No transactions found"}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                wallet.transactions.map((tx) => {
                  const isCredit = tx.type === "CREDIT";
                  return (
                    <TableRow key={tx.id} className="group hover:bg-gray-50/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isCredit ? "bg-green-50 text-green-600 group-hover:bg-green-100" : "bg-red-50 text-red-600 group-hover:bg-red-100"
                          }`}>
                            {isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {getWalletCategoryLabel(tx.category, isRTL)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[200px] md:max-w-[300px]">
                              {tx.description}
                            </p>
                            {tx.referenceId && (
                              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                Ref: {tx.referenceId}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold tracking-tight ${isCredit ? "text-green-600" : "text-gray-900"}`}>
                          {isCredit ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-gray-500 font-medium">
                          {formatCurrency(tx.balancePost, currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {format(new Date(tx.createdAt), "dd MMM yyyy", { locale: isRTL ? arEG : enGB })}
                          </span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(tx.createdAt), "hh:mm a")}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {isDoctor && (
        <>
          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>{isRTL ? "طلب سحب" : "Request Withdrawal"}</DialogTitle></DialogHeader>
              <div className="space-y-2 py-2">
                <Label>{isRTL ? "المبلغ" : "Amount"} ({currency})</Label>
                 <Input type="number" min="50" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                <p className="text-xs text-gray-500">{isRTL ? "الرصيد المتاح" : "Available"}: {formatCurrency(wallet.balance, currency)}</p>
                {withdrawalError && <p className="text-sm text-red-600">{withdrawalError}</p>}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setWithdrawOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button><Button disabled={!!withdrawalError || withdrawal.isPending} onClick={() => withdrawal.mutate()}>{withdrawal.isPending ? "..." : (isRTL ? "إرسال الطلب" : "Submit Request")}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>{isRTL ? "شحن الرصيد" : "Top Up Balance"}</DialogTitle></DialogHeader>
              <div className="space-y-2 py-2">
                <Label>{isRTL ? "المبلغ" : "Amount"} ({currency})</Label>
                <Input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                 <p className="text-xs text-gray-500">{isRTL ? "سيتم تحويلك إلى صفحة الدفع التجريبية الآمنة من Stripe." : "You will be redirected to secure Stripe test checkout."}</p>
                {topUpError && <p className="text-sm text-red-600">{topUpError}</p>}
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setTopUpOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button><Button disabled={!!topUpError || topUp.isPending} onClick={() => topUp.mutate()}>{topUp.isPending ? "..." : (isRTL ? "المتابعة للدفع" : "Continue to Payment")}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
