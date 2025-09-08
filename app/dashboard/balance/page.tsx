"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  Plus,
  Wallet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Balance {
  balance: number;
}

interface Transaction {
  id: string;
  type: "topup" | "usage";
  amount: number;
  description: string | null;
  created_at: string;
}

export default function BalancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(181000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState("");
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"transactions" | "payments">(
    "transactions"
  );
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const itemsPerPage = 5;
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Disabled periodic auto-refresh to prevent balance flicker
  // If you need background refresh, consider using a longer interval
  // or a realtime listener that updates only when data changes.

  const fetchUserData = async () => {
    if (!user) return;

    try {
      let nextBalance: number | null = null;
      let hadBalanceRecord = false;
      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (balanceError) {
        console.error("Error fetching balance:", balanceError);
        nextBalance = 0;
      } else if (balanceData) {
        hadBalanceRecord = true;
        nextBalance = balanceData.balance;
      } else {
        // No balance record found, create one
        console.warn("No balance record found for user:", user.id);
        const { error: createError } = await supabase
          .from("balances")
          .insert({ user_id: user.id, balance: 0 });

        if (createError) {
          console.error("Error creating balance:", createError);
        }
        nextBalance = 0;
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        setTransactions([]);
      } else if (transactionsData) {
        setTransactions(transactionsData);
        // Only compute balance from transactions when there is no balance record
        if (!hadBalanceRecord) {
          try {
            const computed = transactionsData.reduce((acc: number, t: any) => {
              const amt = Number(t.amount) || 0;
              return acc + (t.type === "topup" ? amt : -amt);
            }, 0);
            if (!Number.isNaN(computed)) {
              nextBalance = computed;
            }
          } catch (e) {
            console.warn("Failed to compute balance from transactions:", e);
          }
        }
      } else {
        setTransactions([]);
      }

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
        setPayments([]);
      } else if (paymentsData) {
        setPayments(paymentsData);
      } else {
        setPayments([]);
      }

      // Apply balance state once to avoid flicker
      if (nextBalance !== null) {
        // Persist the computed balance so other pages read the same value
        try {
          const { error: upsertError } = await supabase
            .from("balances")
            .upsert([{ user_id: user.id, balance: nextBalance }], {
              onConflict: "user_id",
            });
          if (upsertError) {
            console.error("Error upserting balance:", upsertError);
          }
        } catch (e) {
          console.error("Unexpected error upserting balance:", e);
        }
        setBalance(nextBalance);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!topupAmount || !user) return;

    setTopupLoading(true);
    setError("");
    try {
      // Get auth token from session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      console.log("Sending topup request:", {
        user_id: user.id,
        email: user.email,
        amount: parseInt(topupAmount),
      });

      // Call n8n webhook for topup with proper authentication
      const response = await fetch(
        "https://n8n.tanam.io/webhook/biling/topup-balance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            email: user.email,
            amount: parseInt(topupAmount),
          }),
        }
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log("Response body:", responseText);

      if (!response.ok) {
        const errorMessage = `HTTP ${response.status}: ${response.statusText} - ${responseText}`;
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      console.log("Parsed result:", result);

      // Handle different response formats
      if (result.success) {
        // If n8n returns payment URL, redirect to payment
        if (result.payment_url) {
          console.log("Redirecting to payment URL:", result.payment_url);

          setIsTopupOpen(false);
          setTopupAmount("");

          toast({
            variant: "success",
            title: "Payment Created",
            description: "Redirecting to payment page...",
          });

          // Redirect immediately to payment page
          window.location.href = result.payment_url;
        } else {
          setIsTopupOpen(false);
          setTopupAmount("");

          toast({
            variant: "success",
            title: "Payment Created",
            description: "Your topup request has been processed.",
          });

          // Refresh data after a short delay to allow webhook processing
          setTimeout(() => {
            fetchUserData();
            window.open(result.invoice_url, "_blank");
          }, 1000);
        }
      } else if (Array.isArray(result) && result.length > 0) {
        // Handle array response format (payment data directly)
        const payment = result[0];
        if (payment.invoice_url) {
          console.log("Redirecting to payment URL:", payment.invoice_url);

          setIsTopupOpen(false);
          setTopupAmount("");

          toast({
            variant: "success",
            title: "Payment Created",
            description: "Redirecting to payment page...",
          });

          // Redirect immediately to payment page
          window.location.href = payment.invoice_url;
        } else {
          setIsTopupOpen(false);
          setTopupAmount("");

          toast({
            variant: "success",
            title: "Payment Created",
            description: "Your topup request has been processed.",
          });

          // Immediately refresh data when no URL returned
          fetchUserData();
        }
      } else if (
        result &&
        typeof result === "object" &&
        (result.invoice_url || result.id)
      ) {
        // Handle plain object response that contains payment info
        const paymentUrl =
          (result as any).invoice_url || (result as any).payment_url;
        if (paymentUrl) {
          console.log("Redirecting to payment URL:", paymentUrl);

          setIsTopupOpen(false);
          setTopupAmount("");

          toast({
            variant: "success",
            title: "Payment Created",
            description: "Redirecting to payment page...",
          });

          // Redirect immediately to payment page
          window.location.href = paymentUrl;
        } else {
          setIsTopupOpen(false);
          setTopupAmount("");

          toast({
            variant: "success",
            title: "Payment Created",
            description: "Your topup request has been processed.",
          });

          // Immediately refresh data when no URL returned
          fetchUserData();
        }
      } else {
        throw new Error(
          result.message ||
            result.error ||
            "Topup gagal diproses. Silakan periksa koneksi internet dan coba lagi."
        );
      }
    } catch (error) {
      console.error("Error processing topup:", error);
      const errorMessage =
        (error as Error).message ||
        "Terjadi kesalahan saat memproses topup. Silakan coba lagi.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Topup Error",
        description: errorMessage,
      });
    } finally {
      setTopupLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      ", " +
      date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Pagination logic
  const getPaginatedData = (data: any[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  const paginatedTransactions = getPaginatedData(
    transactions,
    transactionsPage
  );
  const paginatedPayments = getPaginatedData(payments, paymentsPage);
  const totalTransactionPages = getTotalPages(transactions.length);
  const totalPaymentPages = getTotalPages(payments.length);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saldo</h1>
        <p className="text-gray-600">
          Kelola saldo dan lihat riwayat transaksi Anda
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tukar
          </Button>

          <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Saldo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Isi Saldo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Jumlah (Rp)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="text-center text-lg"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTopupAmount("50000")}
                    className="flex-1"
                  >
                    Rp 50,000
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTopupAmount("100000")}
                    className="flex-1"
                  >
                    Rp 100,000
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTopupAmount("200000")}
                    className="flex-1"
                  >
                    Rp 200,000
                  </Button>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleTopup}
                  disabled={topupLoading || !topupAmount}
                >
                  {topupLoading ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    "Isi Saldo"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Saldo Saat Ini</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 sm:space-x-8 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "transactions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Transaksi
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "payments"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Pembayaran
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {activeTab === "transactions" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500">
                      TANGGAL
                    </th>
                    <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500 hidden sm:table-cell">
                      DESKRIPSI
                    </th>
                    <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500">
                      TIPE
                    </th>
                    <th className="text-right py-3 px-3 lg:px-6 text-sm font-medium text-gray-500">
                      JUMLAH
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-4 px-3 lg:px-6 text-sm text-gray-900">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="py-4 px-3 lg:px-6 text-sm text-gray-900 max-w-md hidden sm:table-cell">
                        {transaction.description}
                      </td>
                      <td className="py-4 px-3 lg:px-6">
                        <div className="flex items-center space-x-2">
                          {transaction.type === "usage" ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-500 hidden sm:block" />
                              <Badge
                                variant="outline"
                                className="text-red-600 border-red-200"
                              >
                                Penggunaan
                              </Badge>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-500 hidden sm:block" />
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                Isi Saldo
                              </Badge>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3 lg:px-6 text-right">
                        <span
                          className={`font-medium ${
                            transaction.type === "usage"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.type === "usage" ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paginatedTransactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500"
                      >
                        Tidak ada transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Transactions Pagination */}
              {transactions.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-500 hidden sm:block">
                    Menampilkan {(transactionsPage - 1) * itemsPerPage + 1}{" "}
                    sampai{" "}
                    {Math.min(
                      transactionsPage * itemsPerPage,
                      transactions.length
                    )}{" "}
                    dari {transactions.length} transaksi
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTransactionsPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={transactionsPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-sm text-gray-500 px-2">
                      Halaman {transactionsPage} dari {totalTransactionPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTransactionsPage((prev) =>
                          Math.min(totalTransactionPages, prev + 1)
                        )
                      }
                      disabled={transactionsPage === totalTransactionPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500">
                      TANGGAL
                    </th>
                    <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500">
                      JUMLAH
                    </th>
                    <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500">
                      STATUS
                    </th>
                    <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-3 lg:px-6 text-sm text-gray-900">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="py-4 px-3 lg:px-6 text-sm text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-4 px-3 lg:px-6">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="py-4 px-3 lg:px-6">
                        {payment.status === "pending" &&
                          payment.invoice_url && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() =>
                                window.open(payment.invoice_url, "_blank")
                              }
                            >
                              Bayar
                            </Button>
                          )}
                      </td>
                    </tr>
                  ))}
                  {paginatedPayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500"
                      >
                        Tidak ada pembayaran
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Payments Pagination */}
              {payments.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-500 hidden sm:block">
                    Menampilkan {(paymentsPage - 1) * itemsPerPage + 1} sampai{" "}
                    {Math.min(paymentsPage * itemsPerPage, payments.length)}{" "}
                    dari {payments.length} pembayaran
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPaymentsPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={paymentsPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-sm text-gray-500 px-2">
                      Halaman {paymentsPage} dari {totalPaymentPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPaymentsPage((prev) =>
                          Math.min(totalPaymentPages, prev + 1)
                        )
                      }
                      disabled={paymentsPage === totalPaymentPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
