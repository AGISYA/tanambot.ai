"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Database } from "@/lib/supabase";
import QRCode from "react-qr-code";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  RefreshCw,
  Plus,
  Bot,
  AlertTriangle,
  Wallet,
  QrCode,
  X,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ChatbotWithPlan = Database["public"]["Tables"]["chatbot"]["Row"] & {
  plans: Database["public"]["Tables"]["plans"]["Row"];
};

type Plan = Database["public"]["Tables"]["plans"]["Row"];

export default function ChatbotsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatbots, setChatbots] = useState<ChatbotWithPlan[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewBotOpen, setIsNewBotOpen] = useState(false);
  const [botName, setBotName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedBotForQR, setSelectedBotForQR] =
    useState<ChatbotWithPlan | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(10);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchChatbots();
      fetchPlans();
      fetchBalance();
    }
  }, [user]);

  const fetchQRCode = useCallback(
    async (chatbotId: string) => {
      if (!user) return;

      setQrLoading(true);
      setQrCode(""); // Reset QR code
      try {
        // Get auth token from session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          console.error("No authentication token found");
          alert("Session expired. Please login again.");
          return;
        }

        console.log("Fetching QR code for chatbot:", chatbotId);
        console.log(
          "Using auth token:",
          session.access_token.substring(0, 20) + "..."
        );

        // Call QR service via Next.js proxy to avoid CORS issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response;
        try {
          response = await fetch("/api/qr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
              Accept: "application/json",
            },
            body: JSON.stringify({
              id: chatbotId,
            }),
            signal: controller.signal,
          });
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              throw new Error(
                "Request timeout - QR service took too long to respond"
              );
            } else if (fetchError.message.includes("Failed to fetch")) {
              throw new Error(
                "Unable to connect to QR service. This could be due to:\n• Network connectivity issues\n• CORS policy blocking the request\n• QR service is temporarily unavailable\n\nPlease try again later or contact support."
              );
            }
          }
          throw fetchError;
        }

        clearTimeout(timeoutId);

        console.log("QR Response status:", response.status);
        console.log(
          "QR Response headers:",
          Object.fromEntries(response.headers.entries())
        );

        const responseText = await response.text();
        console.log("QR Response body:", responseText);

        if (!response.ok) {
          console.error(
            `QR API Error: ${response.status} ${response.statusText}`
          );
          console.error("Error response:", responseText);

          if (response.status === 0) {
            throw new Error(
              "Network error: Unable to reach QR service. Please check your internet connection."
            );
          } else if (response.status >= 500) {
            throw new Error(
              `QR service is temporarily unavailable (${response.status}). Please try again later.`
            );
          } else if (response.status === 404) {
            throw new Error(
              "QR service endpoint not found. Please contact support."
            );
          } else {
            throw new Error(
              `QR service error: ${response.status} ${response.statusText}`
            );
          }
        }

        // Try to parse JSON response
        let data;
        try {
          data = JSON.parse(responseText);
          console.log("QR Response data:", data);
        } catch (parseError) {
          console.error("Failed to parse QR response as JSON:", parseError);
          console.error("Raw response:", responseText);
          throw new Error("Invalid response format from QR service");
        }

        if (data.qr) {
          console.log("QR code received, length:", data.qr.length);
          setQrCode(data.qr);
        } else if (data.error) {
          console.error("QR API returned error:", data.error);
          throw new Error(`QR service error: ${data.error}`);
        } else {
          console.error(
            "No QR code in response, available keys:",
            Object.keys(data)
          );
          throw new Error("QR code not available in response");
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);

        // Show user-friendly error message
        toast({
          variant: "destructive",
          title: "QR Code Error",
          description: (error as Error).message,
        });
      } finally {
        setQrLoading(false);
      }
    },
    [user]
  );

  // Auto refresh chatbots every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchChatbots();
      fetchBalance(); // Also refresh balance
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Listen for usage updates via polling more frequently
  useEffect(() => {
    if (!user) return;

    const usageInterval = setInterval(() => {
      // Refresh usage data more frequently (every 2 seconds)
      fetchChatbots();
    }, 2000);

    return () => clearInterval(usageInterval);
  }, [user]);

  // QR refresh countdown
  useEffect(() => {
    if (!qrDialogOpen) return;

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          if (selectedBotForQR) {
            fetchQRCode(selectedBotForQR.id);
          }
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qrDialogOpen, selectedBotForQR, fetchQRCode]);

  // Check if bot status changed from NEED_SCAN_QR to WORKING
  useEffect(() => {
    if (selectedBotForQR && qrDialogOpen) {
      const currentBot = chatbots.find((bot) => bot.id === selectedBotForQR.id);
      if (currentBot && currentBot.status === "WORKING") {
        setQrDialogOpen(false);
        setSelectedBotForQR(null);
        setQrCode("");
        // Refresh the page to show updated status
        window.location.reload();
      }
    }
  }, [chatbots, selectedBotForQR, qrDialogOpen]);

  const fetchChatbots = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("chatbot")
        .select(
          `
          *,
          plans (*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching chatbots:", error);
        return;
      }

      setChatbots(data || []);
    } catch (error) {
      console.error("Error fetching chatbots:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price_per_month", { ascending: true });

      if (error) {
        console.error("Error fetching plans:", error);
        return;
      }

      setPlans(data || []);
      if (data && data.length > 0) {
        setSelectedPlan(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchBalance = async () => {
    if (!user) return;

    setBalanceLoading(true);
    try {
      // 1) Read current balance row (may be stale)
      let rowBalance = 0;
      let hasRow = false;
      const { data: balanceData, error: balanceError } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();
      if (balanceError) {
        console.error("Error fetching balance:", balanceError);
      }
      {
        balanceData &&
          typeof balanceData.balance !== "undefined" &&
          balanceData.balance !== null;

        setBalance(balanceData?.balance);
      }

      // 2) Compute fresh balance from transactions (authoritative)
      // let computedBalance = rowBalance;
      // try {
      //   // Gunakan fungsi rekonsiliasi pusat agar konsisten dengan tabel balances
      //   computedBalance = await reconcileAndGetBalance(supabase, user.id);
      // } catch (e) {
      //   console.warn("Failed to reconcile balance:", e);
      // }

      // 3) Ensure row exists
      // if (!hasRow) {
      //   const { error: createError } = await supabase
      //     .from("balances")
      //     .insert({ user_id: user.id, balance: balanceData?.balance });
      //   if (createError) {
      //     console.error("Error creating initial balance row:", createError);
      //   }
      // }

      // 4) Persist reconciled balance if differs
      // try {
      //   if (!hasRow || rowBalance !== computedBalance) {
      //     const { error: upsertError } = await supabase
      //       .from("balances")
      //       .upsert([{ user_id: user.id, balance: computedBalance }], {
      //         onConflict: "user_id",
      //       });
      //     if (upsertError) {
      //       console.error("Error upserting balance:", upsertError);
      //     }
      //   }
      // } catch (e) {
      //   console.error("Unexpected error upserting balance:", e);
      // }

      // if (!creating) {
      //   setBalance(computedBalance);
      // }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const getSelectedPlanData = () => {
    return plans.find((plan) => plan.id === selectedPlan);
  };

  const isBalanceSufficient = () => {
    const plan = getSelectedPlanData();
    if (!plan) return false;
    return balance >= plan.price_per_month;
  };

  const handleCreateBot = async () => {
    console.log("check handle create");
    if (!botName.trim() || !selectedPlan || !user) return;

    setCreating(true);
    const prevBalance = balance;
    try {
      // Cek apakah bot dengan nama yang sama sudah ada untuk mencegah duplikasi
      const { data: existingBots, error: checkError } = await supabase
        .from("chatbot")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", botName.trim())
        .limit(1);

      if (checkError) {
        console.error("Error checking existing bots:", checkError);
      } else if (existingBots && existingBots.length > 0) {
        throw new Error(
          `Bot dengan nama "${botName}" sudah ada. Gunakan nama lain.`
        );
      }

      // Get auth token from session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      console.log("Creating bot with payload:", {
        name: botName,
        plan_id: selectedPlan,
      });

      // Call n8n webhook for bot creation
      const response = await fetch(
        "https://n8n.tanam.io/webhook/chatbot/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: botName,
            plan_id: selectedPlan,
          }),
        }
      );

      console.log("Response status:", response.status);

      if (response.status === 200) {
        // Success
        console.log("Bot created successfully");
        toast({
          variant: "success",
          title: "Success",
          description: "Bot berhasil dibuat!",
        });

        // Close dialog and reset form
        setIsNewBotOpen(false);
        setBotName("");

        // Refresh chatbots list
        fetchChatbots();

        // Post-create balance reconciliation to ensure correct deduction
        try {
          const plan = getSelectedPlanData();
          if (plan) {
            const price = Number(plan.price_per_month) || 0;

            // Compute fresh balance from transactions
            let computedBalance = prevBalance;
            const { data: transactionsData, error: txError } = await supabase
              .from("transactions")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });

            if (!txError && Array.isArray(transactionsData)) {
              computedBalance = transactionsData.reduce(
                (acc: number, t: any) => {
                  const amt = Number(t.amount) || 0;
                  return acc + (t.type === "topup" ? amt : -amt);
                },
                0
              );
            } else if (txError) {
              console.warn(
                "Gagal mengambil transaksi untuk rekonsiliasi:",
                txError
              );
            }

            const delta = computedBalance - prevBalance;
            // Hanya lakukan rekonsiliasi jika saldo bertambah sebesar harga paket (kesalahan: dicatat sebagai topup)
            // Jangan lakukan rekonsiliasi jika delta === 0 karena mungkin webhook sudah membuat transaksi yang benar
            if (price > 0 && delta === price) {
              console.log(
                "Reconciling post-create charge. prev=",
                prevBalance,
                "now=",
                computedBalance,
                "price=",
                price
              );

              // Cek apakah sudah ada transaksi usage untuk pembuatan bot ini untuk mencegah duplikasi
              const planData = getSelectedPlanData();
              const botCreationDesc = `Create Bot ${botName} - Plan ${
                planData?.name || "Unknown"
              }`;
              const { data: existingTx, error: txCheckError } = await supabase
                .from("transactions")
                .select("id")
                .eq("user_id", user.id)
                .eq("type", "usage")
                .eq("amount", price)
                .ilike("description", `%${botName}%`)
                .order("created_at", { ascending: false })
                .limit(1);

              if (txCheckError) {
                console.warn(
                  "Error checking existing transactions:",
                  txCheckError
                );
              }

              // Hanya buat transaksi usage jika belum ada
              if (!existingTx || existingTx.length === 0) {
                const { error: insertErr } = await supabase
                  .from("transactions")
                  .insert({
                    user_id: user.id,
                    type: "usage",
                    amount: price,
                    description: botCreationDesc,
                  });
                if (insertErr) {
                  console.error(
                    "Gagal menyisipkan transaksi usage untuk pembuatan:",
                    insertErr
                  );
                } else {
                  // Upsert saldo hasil rekonsiliasi agar konsisten antar halaman
                  const newBalance = computedBalance - price;
                  const { error: upsertErr } = await supabase
                    .from("balances")
                    .upsert([{ user_id: user.id, balance: newBalance }], {
                      onConflict: "user_id",
                    });
                  if (upsertErr) {
                    console.error(
                      "Gagal upsert saldo setelah rekonsiliasi:",
                      upsertErr
                    );
                  }
                }
              }
            }
          }
        } catch (reconErr) {
          console.warn("Post-create charge reconciliation failed:", reconErr);
        }

        // Refresh balance state for UI consistency
        fetchBalance();
      } else {
        // Failed
        const errorText = await response.text();
        console.error("Failed to create bot:", errorText);
        throw new Error(
          `Failed to create bot: ${response.status} ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error creating bot:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Gagal membuat bot: ${(error as Error).message}`,
      });
    } finally {
      setCreating(false);
      // Now refresh balance after creation completes to avoid temporary inconsistencies
      fetchBalance();
    }
  };

  const handleDeleteBot = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("chatbot")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;

      setChatbots((prev) => prev.filter((b) => b.id !== id));
      toast({
        variant: "success",
        title: "Berhasil",
        description: "Chatbot berhasil dihapus.",
      });
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast({
        variant: "destructive",
        title: "Gagal menghapus",
        description:
          (error as Error).message ||
          "Terjadi kesalahan saat menghapus chatbot.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setBotName("");
    if (plans.length > 0) {
      setSelectedPlan(plans[0].id);
    }
  };

  const getStatusBadge = (status: string, chatbot: ChatbotWithPlan) => {
    switch (status) {
      case "PROVISIONING":
        return (
          <Badge className="bg-blue-100 text-blue-800">Provisioning</Badge>
        );
      case "NEED_SCAN_QR":
        return (
          <Badge
            className="bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200 transition-colors"
            onClick={() => {
              setSelectedBotForQR(chatbot);
              fetchQRCode(chatbot.id);
              setQrDialogOpen(true);
            }}
          >
            Need Scan QR
          </Badge>
        );
      case "WORKING":
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800">Provisioning</Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDaysLeft = (expiredAt: string | null) => {
    if (!expiredAt) return 0;
    const now = new Date();
    const expiry = new Date(expiredAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUsageText = (chatbot: ChatbotWithPlan) => {
    const percentage = chatbot.ai_quota
      ? Math.round(((chatbot.ai_usages || 0) / chatbot.ai_quota) * 100)
      : 0;
    return `${percentage}% used`;
  };

  const filteredChatbots = chatbots.filter(
    (chatbot) =>
      chatbot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatbot.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chatbot</h1>

        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-4 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari chatbot berdasarkan nama atau ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full lg:w-80"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <Button variant="outline" size="sm" className="flex-1 lg:flex-none">
              <RefreshCw className="h-4 w-4 mr-2" />
              {loading ? "Memuat..." : "Refresh"}
            </Button>
            <Dialog
              open={isNewBotOpen}
              onOpenChange={(open) => {
                setIsNewBotOpen(open);
                if (open) fetchBalance();
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 flex-1 lg:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Bot Baru
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500 min-w-[150px]">
                    Nama
                  </th>
                  <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500 min-w-[100px]">
                    Status
                  </th>
                  <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500 min-w-[120px] hidden sm:table-cell">
                    Paket
                  </th>
                  <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500 min-w-[100px] hidden md:table-cell">
                    Perpanjangan Otomatis
                  </th>
                  <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500 min-w-[120px] hidden lg:table-cell">
                    Penggunaan AI
                  </th>
                  <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500 min-w-[120px] hidden xl:table-cell">
                    Berakhir Pada
                  </th>
                  <th className="text-left py-3 px-3 lg:px-6 text-sm font-medium text-gray-500 min-w-[100px]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500 text-sm"
                    >
                      Loading chatbots...
                    </td>
                  </tr>
                ) : filteredChatbots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500 text-sm"
                    >
                      {searchQuery
                        ? "Tidak ada chatbot yang ditemukan sesuai pencarian Anda"
                        : "Tidak ada chatbot ditemukan"}
                    </td>
                  </tr>
                ) : (
                  filteredChatbots.map((chatbot) => (
                    <tr key={chatbot.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-3 lg:px-6">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              chatbot.is_active ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            <Bot
                              className={`h-4 w-4 ${
                                chatbot.is_active
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {chatbot.name || "Bot Tanpa Nama"}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {chatbot.plans?.name || "Tanpa Paket"} •{" "}
                              {getUsageText(chatbot)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 lg:px-6">
                        {getStatusBadge(
                          chatbot.status || "PROVISIONING",
                          chatbot
                        )}
                      </td>
                      <td className="py-4 px-3 lg:px-6 hidden sm:table-cell">
                        <div>
                          <div className="font-medium text-gray-900">
                            {chatbot.plans?.name || "Tanpa Paket"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {chatbot.plans?.price_per_month
                              ? formatCurrency(chatbot.plans.price_per_month)
                              : "Gratis"}
                            /bulan
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 lg:px-6 hidden md:table-cell">
                        <div
                          className={`w-10 h-6 rounded-full ${
                            chatbot.is_auto_renewal
                              ? "bg-green-500"
                              : "bg-gray-300"
                          } relative cursor-pointer`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                              chatbot.is_auto_renewal
                                ? "translate-x-5"
                                : "translate-x-1"
                            }`}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4 px-3 lg:px-6 hidden lg:table-cell">
                        <div>
                          <div className="text-gray-900">
                            {chatbot.ai_usages?.toLocaleString() || "0"} /{" "}
                            {chatbot.ai_quota?.toLocaleString() || "0"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {chatbot.ai_quota
                              ? Math.round(
                                  ((chatbot.ai_usages || 0) /
                                    chatbot.ai_quota) *
                                    100
                                )
                              : 0}
                            % used
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 lg:px-6 hidden xl:table-cell">
                        <div>
                          <div className="text-gray-900">
                            {formatDate(chatbot.expired_at)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ({getDaysLeft(chatbot.expired_at)} hari tersisa)
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 lg:px-6">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/chatbots/${chatbot.id}`}>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              Kelola
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full sm:w-auto"
                                disabled={deletingId === chatbot.id}
                              >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                {deletingId === chatbot.id
                                  ? "Menghapus..."
                                  : "Hapus"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Chatbot?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tindakan ini tidak dapat dibatalkan. Ini akan menghapus chatbot
                                  {chatbot.name || "Bot Tanpa Nama"} secara permanen dari akun Anda.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBot(chatbot.id)}
                                  disabled={deletingId === chatbot.id}
                                >
                                  Ya, hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 px-3 lg:px-6 py-4 border-t">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Menampilkan {filteredChatbots.length} dari {chatbots.length}{" "}
              chatbot
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Button variant="outline" size="sm" disabled>
                Sebelumnya
              </Button>
              <span className="text-gray-500">Halaman 1 dari 1</span>
              <Button variant="outline" size="sm" disabled>
                Selanjutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Bot Dialog */}
      <Dialog
        open={isNewBotOpen}
        onOpenChange={(open) => {
          setIsNewBotOpen(open);
          if (open) fetchBalance();
          if (!open) resetForm();
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Chatbot Baru</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Left: Form */}
            <div className="space-y-6">
              {/* Bot Name */}
              <div className="space-y-2">
                <Label htmlFor="botName">Nama Bot</Label>
                <Input
                  id="botName"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Masukkan nama bot..."
                  className="w-full"
                />
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <Label>Pilih Paket</Label>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <RadioGroupItem value={plan.id} id={plan.id} />
                      <div className="flex-1">
                        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <Label
                            htmlFor={plan.id}
                            className="font-medium cursor-pointer"
                          >
                            {plan.name}
                          </Label>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(plan.price_per_month)}
                          </span>
                        </div>
                        {plan.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {plan.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {plan.ai_quota.toLocaleString()} AI tokens/month
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Right: Summary + Actions */}
            <div className="space-y-4">
              {/* Balance Check */}
              <div className="space-y-3">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Saldo Saat Ini</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(balance)}
                  </span>
                </div>

                {getSelectedPlanData() && (
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 border rounded-lg">
                    <span className="text-sm font-medium">Biaya Paket</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(getSelectedPlanData()!.price_per_month)}
                    </span>
                  </div>
                )}

                {!isBalanceSufficient() && getSelectedPlanData() && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <div className="space-y-2">
                        <p>
                          Saldo tidak mencukupi. Anda membutuhkan{" "}
                          {formatCurrency(
                            getSelectedPlanData()!.price_per_month - balance
                          )}{" "}
                          lagi untuk membuat bot ini.
                        </p>
                        <Link href="/dashboard/balance">
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Wallet className="h-3 w-3 mr-1" />
                            Isi Saldo
                          </Button>
                        </Link>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {isBalanceSufficient() && getSelectedPlanData() && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">
                      ✓ Saldo mencukupi. Sisa setelah pembuatan:{" "}
                      {formatCurrency(
                        balance - getSelectedPlanData()!.price_per_month
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setIsNewBotOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleCreateBot}
                  disabled={
                    !botName.trim() ||
                    !selectedPlan ||
                    !isBalanceSufficient() ||
                    creating
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? "Membuat..." : "Buat Bot"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-orange-600" />
                <DialogTitle className="truncate">
                  {selectedBotForQR?.name || "Bot"}
                </DialogTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-orange-100 text-orange-800 text-xs">
                  PINDAI_QR_CODE
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQrDialogOpen(false);
                    setSelectedBotForQR(null);
                    setQrCode("");
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <QrCode className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Pindai Kode QR</span>
            </div>

            <p className="text-sm text-gray-600">
              Pindai kode QR untuk mengotorisasi sesi ini.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                  1
                </span>
                <span>Buka WhatsApp di ponsel Anda</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                  2
                </span>
                <span>Ketuk opsi Menu atau Pengaturan ⚙</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                  3
                </span>
                <span>Ketuk Perangkat Tertaut dan Tautkan perangkat</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                  4
                </span>
                <span>
                  Arahkan ponsel Anda ke layar ini untuk menangkap kode QR
                </span>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Kode QR</span>
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh dalam {refreshCountdown}d</span>
                  </div>
                </div>

                {/* QR Code Placeholder */}
                <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                  {qrLoading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                      <span className="text-sm text-gray-500">
                        Memuat QR...
                      </span>
                    </div>
                  ) : qrCode ? (
                    <div className="p-4">
                      <QRCode
                        value={qrCode}
                        size={window.innerWidth < 640 ? 160 : 224}
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 sm:w-56 sm:h-56 bg-gray-100 rounded flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {!qrCode && !qrLoading && (
                  <p className="text-xs text-gray-500">
                    Kode QR akan dibuat di sini
                  </p>
                )}

                {qrCode && (
                  <p className="text-xs text-green-600">
                    ✓ Kode QR siap dipindai
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
