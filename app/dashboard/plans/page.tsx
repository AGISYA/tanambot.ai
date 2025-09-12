"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Database } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Wallet, Calendar, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Plan = Database["public"]["Tables"]["plans"]["Row"];
type ChatbotRow = Database["public"]["Tables"]["chatbot"]["Row"];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Tidak diketahui";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const daysRemaining = (dateString: string | null) => {
  if (!dateString) return 0;
  const expiredDate = new Date(dateString);
  const today = new Date();
  const diffTime = expiredDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export default function PlansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatbotId = searchParams.get("chatbotId");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [chatbot, setChatbot] = useState<ChatbotRow | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingChatbot, setLoadingChatbot] = useState(true);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchChatbot();
      fetchBalance();
    }
  }, [user, chatbotId]);

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
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchChatbot = async () => {
    if (!chatbotId || !user) return;

    try {
      const { data, error } = await supabase
        .from("chatbot")
        .select("*")
        .eq("id", chatbotId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching chatbot:", error);
        return;
      }

      setChatbot(data);
    } catch (error) {
      console.error("Error fetching chatbot:", error);
    } finally {
      setLoadingChatbot(false);
    }
  };

  const fetchBalance = async () => {
    if (!user) return;

    try {
      const { data: balanceData } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      setBalance(balanceData?.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const openPurchaseDialog = async (plan: Plan) => {
    // Refresh balance and chatbot data before opening dialog
    await fetchBalance();
    await fetchChatbot();

    setSelectedPlan(plan);
    setPurchaseDialogOpen(true);
  };

  const isBalanceSufficient = () => {
    if (!selectedPlan) return false;
    return balance >= selectedPlan.price_per_month;
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !chatbot || !user) return;

    setPurchasing(true);

    try {
      // Get auth token from session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      console.log("Renewing chatbot:", chatbot.id);

      const prevExpiredAt = chatbot.expired_at || null;
      const prevAiQuota =
        typeof chatbot.ai_quota === "number" ? chatbot.ai_quota : 0;

      // Call n8n webhook for renewal
      const response = await fetch("https://n8n.tanam.io/webhook/bot/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: chatbot.id,
          planId: selectedPlan.id,
        }),
      });

      toast({
        variant: "success",
        title: "Berhasil!",
        description: `Paket berhasil diupgrade ke ${selectedPlan.name}. Masa aktif diperpanjang 30 hari.`,
      });

      setPurchaseDialogOpen(false);
    } catch (error) {
      console.error("Error purchasing plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal melakukan upgrade paket. Silakan coba lagi.",
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loadingPlans || loadingChatbot) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link
            href={chatbotId ? `/dashboard/chatbots/${chatbotId}` : "/dashboard"}
          >
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Memuat paket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={chatbotId ? `/dashboard/chatbots/${chatbotId}` : "/dashboard"}
        >
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
          Pilih Paket
        </h1>
        <p className="text-gray-600">
          Pilih paket yang sesuai dengan kebutuhan chatbot Anda
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = chatbot?.plan_id === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative ${
                isCurrentPlan
                  ? "border-green-500 bg-green-50"
                  : "hover:shadow-lg transition-shadow"
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {isCurrentPlan && (
                    <Badge className="bg-green-100 text-green-800">
                      Saat Ini
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Harga Bulanan</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(plan.price_per_month)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Kuota AI</span>
                    <span className="font-medium">
                      {plan.ai_quota.toLocaleString()} token
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Perpanjangan Otomatis
                    </span>
                    <span className="font-medium text-green-600">Aktif</span>
                  </div>

                  {isCurrentPlan && chatbot?.expired_at && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Berakhir</span>
                      <span className="font-medium">
                        {formatDate(chatbot.expired_at)}
                        <span className="text-sm text-gray-500 ml-1">
                          ({daysRemaining(chatbot.expired_at)} hari tersisa)
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium mb-2">Fitur Paket</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>
                        {plan.ai_quota.toLocaleString()} token AI per bulan
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Integrasi WhatsApp</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Analitik dasar</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Dukungan email</span>
                    </li>
                  </ul>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full" variant="outline">
                      Paket Saat Ini
                    </Button>
                  ) : (
                    <Button
                      onClick={() => openPurchaseDialog(plan)}
                      className="w-full"
                    >
                      Beli / Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembelian</DialogTitle>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                <p className="text-gray-600">{selectedPlan.description}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Harga:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedPlan.price_per_month)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kuota AI:</span>
                    <span className="font-medium">
                      {selectedPlan.ai_quota.toLocaleString()} token
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Saldo Saat Ini</span>
                  <span className="text-sm">{formatCurrency(balance)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium">
                    Saldo Setelah Pembelian
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isBalanceSufficient() ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(balance - selectedPlan.price_per_month)}
                  </span>
                </div>
              </div>

              {!isBalanceSufficient() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">
                    Saldo tidak cukup. Anda membutuhkan{" "}
                    {formatCurrency(selectedPlan.price_per_month - balance)}{" "}
                    lagi.
                  </p>
                  <Link href="/dashboard/balance" className="inline-block mt-2">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Wallet className="h-3 w-3 mr-1" />
                      Isi Saldo
                    </Button>
                  </Link>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPurchaseDialogOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={!isBalanceSufficient() || purchasing}
                  className="flex-1"
                >
                  {purchasing ? "Memproses..." : "Konfirmasi"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
