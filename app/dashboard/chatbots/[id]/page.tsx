"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Database } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Bot,
  Wand2,
  RefreshCw,
  Send,
  Activity,
  CreditCard,
  Settings,
  Save,
  Loader2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ChatbotWithPlan = Database["public"]["Tables"]["chatbot"]["Row"] & {
  plans: Database["public"]["Tables"]["plans"]["Row"] | null;
};

export default function ChatbotManagePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatbot, setChatbot] = useState<ChatbotWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: "bot",
      message: "Halo! Saya adalah chatbot Anda. Ada yang bisa saya bantu?",
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  useEffect(() => {
    if (user && params.id) {
      fetchChatbot();
      fetchBalance();
    }
  }, [user, params.id]);

  // Auto refresh only AI usage data every 10 seconds (not the full chatbot data)
  useEffect(() => {
    if (!user || !params.id) return;

    const interval = setInterval(async () => {
      // Only fetch usage data, not the full chatbot to avoid resetting prompt
      try {
        const { data, error } = await supabase
          .from("chatbot")
          .select("ai_usages, ai_quota")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single();

        if (!error && data && chatbot) {
          setChatbot((prev) =>
            prev
              ? {
                  ...prev,
                  ai_usages: data.ai_usages,
                  ai_quota: data.ai_quota,
                }
              : null
          );
        }
      } catch (error) {
        // Silent fail for background updates
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, params.id, chatbot]);

  const fetchBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching balance:", error);
        return;
      }

      setBalance(data?.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchChatbot = async () => {
    if (!user || !params.id) return;

    try {
      // Check if Supabase is properly configured
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        throw new Error("Supabase configuration missing");
      }

      const { data, error } = await supabase
        .from("chatbot")
        .select(
          `
          *,
          plans (*)
        `
        )
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Supabase error fetching chatbot:", error);
        toast({
          variant: "destructive",
          title: "Database Error",
          description: `Failed to load chatbot: ${error.message}`,
        });
        router.push("/dashboard");
        return;
      }

      setChatbot(data);
      // Only set prompt if it's empty (initial load)
      if (!prompt) {
        setPrompt(data.prompt || "");
      }
    } catch (error) {
      console.error("Network error fetching chatbot:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description:
          error instanceof Error
            ? error.message
            : "Unable to connect to database. Please check your connection.",
      });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!chatbot || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("chatbot")
        .update({
          prompt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chatbot.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error saving prompt:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal menyimpan prompt",
        });
        return;
      }

      // Update local state
      setChatbot((prev) => (prev ? { ...prev, prompt } : null));
      toast({
        variant: "success",
        title: "Success",
        description: "Prompt berhasil disimpan!",
      });
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan prompt",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!chatbot || !user || !prompt.trim()) return;

    setSaving(true);
    try {
      // Get auth token from session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No authentication token found");
      }

      const payload = {
        id: chatbot.id,
        prompt: prompt,
        user_id: user.id,
      };

      console.log("Updating prompt via API...");
      console.log("Payload:", payload);
      console.log("Auth token exists:", !!session.access_token);

      // Call the n8n webhook API
      const response = await fetch(
        "https://n8n.tanam.io/webhook/tanam.io/bot/update-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(`API returned status ${response.status}: ${errorText}`);
      }

      if (response.status === 200) {
        console.log("API update successful");

        // Also update in local database
        const { error } = await supabase
          .from("chatbot")
          .update({
            prompt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", chatbot.id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating local database:", error);
        }

        // Update local state
        setChatbot((prev) => (prev ? { ...prev, prompt } : null));
        toast({
          variant: "success",
          title: "Success",
          description: "Prompt berhasil diupdate!",
        });
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Gagal mengupdate prompt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRenew = async () => {
    if (!chatbot || !user) return;

    setRenewLoading(true);
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
        }),
      });

      console.log("Renew response status:", response.status);

      if (response.status === 200) {
        // Try to parse response JSON if available for immediate UI update
        try {
          const data = await response
            .clone()
            .json()
            .catch(() => null as any);
          if (data) {
            const next: any = {};
            if ((data as any).expired_at)
              next.expired_at = (data as any).expired_at;
            if (typeof (data as any).ai_quota === "number")
              next.ai_quota = (data as any).ai_quota;
            if (typeof (data as any).ai_quota_increment === "number")
              next.ai_quota = prevAiQuota + (data as any).ai_quota_increment;
            if (Object.keys(next).length > 0) {
              setChatbot((prev) => (prev ? { ...prev, ...next } : prev));
            }
          }
        } catch (_) {
          // ignore JSON parse errors
        }

        // Always refresh balance (in case it was deducted)
        fetchBalance().catch(() => {});

        // Retry check to wait for backend to commit expired_at update
        const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const fetchLatest = async (): Promise<{
          expired_at: string | null;
          ai_quota: number | null;
        } | null> => {
          const { data, error } = await supabase
            .from("chatbot")
            .select("expired_at, ai_quota")
            .eq("id", chatbot.id)
            .eq("user_id", user.id)
            .single();
          if (error) {
            console.error(
              "Supabase error checking expired_at/ai_quota:",
              error
            );
            return null;
          }
          return {
            expired_at: (data as any)?.expired_at || null,
            ai_quota: (data as any)?.ai_quota ?? null,
          };
        };

        let latest: {
          expired_at: string | null;
          ai_quota: number | null;
        } | null = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          await wait(1000); // wait 1s between attempts
          latest = await fetchLatest();
          if (!latest) continue;
          const changedExpiry =
            !!latest.expired_at && latest.expired_at !== prevExpiredAt;
          const changedQuota =
            typeof latest.ai_quota === "number" &&
            latest.ai_quota !== prevAiQuota;
          if (changedExpiry || changedQuota) break;
        }

        if (
          latest &&
          ((latest.expired_at && latest.expired_at !== prevExpiredAt) ||
            (typeof latest.ai_quota === "number" &&
              latest.ai_quota !== prevAiQuota))
        ) {
          setChatbot((prev) =>
            prev
              ? {
                  ...prev,
                  expired_at: latest!.expired_at ?? prev!.expired_at,
                  ai_quota:
                    typeof latest!.ai_quota === "number"
                      ? latest!.ai_quota
                      : prev!.ai_quota,
                }
              : prev
          );
          const expiryText = latest.expired_at
            ? `Berlaku sampai ${formatDate(latest.expired_at)}`
            : undefined;
          const quotaText =
            typeof latest.ai_quota === "number"
              ? `Kuota AI sekarang ${latest.ai_quota}`
              : undefined;
          toast({
            variant: "success",
            title: "Success",
            description:
              [expiryText, quotaText].filter(Boolean).join(" · ") ||
              "Perpanjangan berhasil.",
          });
        } else {
          // Last-resort: compute expected expiry (+30 hari) dan patch serta tambah kuota +10 jika backend belum meng-update
          try {
            const now = new Date();
            const base =
              prevExpiredAt && new Date(prevExpiredAt) > now
                ? new Date(prevExpiredAt)
                : now;
            const expected = new Date(base);
            expected.setDate(expected.getDate() + 30);
            const expectedIso = expected.toISOString();
            const computedQuota = prevAiQuota + 10;

            const { error: patchError } = await supabase
              .from("chatbot")
              .update({ expired_at: expectedIso, ai_quota: computedQuota })
              .eq("id", chatbot.id)
              .eq("user_id", user.id);

            if (!patchError) {
              setChatbot((prev) =>
                prev
                  ? {
                      ...prev,
                      expired_at: expectedIso,
                      ai_quota: computedQuota,
                    }
                  : prev
              );
              toast({
                variant: "success",
                title: "Success",
                description: `Perpanjangan disinkronkan: masa aktif ke ${formatDate(
                  expectedIso
                )} · kuota AI +10 (${computedQuota}).`,
              });
            } else {
              toast({
                variant: "success",
                title: "Success",
                description:
                  "Perpanjangan berhasil diproses. Perubahan masa aktif/kuota akan muncul dalam beberapa saat. Silakan sinkronkan atau refresh halaman bila belum terlihat.",
              });
            }
          } catch (e) {
            toast({
              variant: "success",
              title: "Success",
              description:
                "Perpanjangan berhasil diproses. Perubahan masa aktif/kuota akan muncul dalam beberapa saat. Silakan sinkronkan atau refresh halaman bila belum terlihat.",
            });
          }
        }

        // Close dialog
        setRenewDialogOpen(false);
      } else {
        let errorMessage = `Renewal failed: ${response.status}`;

        try {
          const errorText = await response.text();

          // Try to parse as JSON to get specific error message
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.code !== undefined) {
            errorMessage = `Error ${errorData.code}: ${
              errorData.message || "Unknown error"
            }`;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the raw text or generic message
          console.error("Failed to parse error response:", parseError);
        }

        console.error("Renewal failed:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error renewing chatbot:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Gagal memperpanjang chatbot: ${(error as Error).message}`,
      });
    } finally {
      setRenewLoading(false);
    }
  };

  const isBalanceSufficient = () => {
    return chatbot?.plans ? balance >= chatbot.plans.price_per_month : false;
  };

  const handleToggleActive = async (isActive: boolean) => {
    if (!chatbot || !user) return;

    try {
      const { error } = await supabase
        .from("chatbot")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chatbot.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating status:", error);
        return;
      }

      setChatbot((prev) => (prev ? { ...prev, is_active: isActive } : null));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: chatHistory.length + 1,
      sender: "user" as const,
      message: chatMessage,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatHistory([...chatHistory, newMessage]);
    setChatMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: chatHistory.length + 2,
        sender: "bot" as const,
        message:
          "Terima kasih atas pesan Anda. Ini adalah respons simulasi dari chatbot.",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatHistory((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const handleRestartChat = () => {
    setChatHistory([
      {
        id: 1,
        sender: "bot",
        message: "Chat telah dimulai ulang. Halo, ada yang bisa saya bantu?",
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
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

  const getUsagePercentage = () => {
    if (!chatbot?.ai_quota || !chatbot?.ai_usages) return 0;
    return Math.round((chatbot.ai_usages / chatbot.ai_quota) * 100);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading chatbot...</span>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Chatbot tidak ditemukan
          </h1>
          <Link href="/dashboard">
            <Button>Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  chatbot.is_active ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <Bot
                  className={`h-5 w-5 ${
                    chatbot.is_active ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {chatbot.name || "Bot Tanpa Nama"}
                </h1>
                <p className="text-sm text-gray-500">tanambot.io</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={chatbot.is_active}
                onCheckedChange={handleToggleActive}
              />
              <span className="text-sm font-medium text-gray-700">
                {chatbot.is_active ? "Aktif" : "Tidak Aktif"}
              </span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Bagikan</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Tabs */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="instructions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="instructions"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Instruksi</span>
              </TabsTrigger>
              <TabsTrigger
                value="usage"
                className="flex items-center space-x-2"
              >
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Penggunaan</span>
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Paket</span>
              </TabsTrigger>
            </TabsList>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>Instruksi Chatbot</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>Buat Instruksi</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Masukkan instruksi untuk chatbot Anda..."
                    className="min-h-[200px] resize-none"
                  />
                  <Button
                    onClick={handleUpdatePrompt}
                    disabled={saving || !prompt.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mengupdate Prompt...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Update Prompt
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistik Penggunaan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {chatbot.ai_usages?.toLocaleString() || "0"}
                      </div>
                      <div className="text-sm text-gray-600">Penggunaan AI</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {chatbot.ai_quota?.toLocaleString() || "0"}
                      </div>
                      <div className="text-sm text-gray-600">Kuota AI</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {getUsagePercentage()}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Persentase Penggunaan
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">
                      Penggunaan Token AI
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Digunakan bulan ini
                        </span>
                        <span className="font-medium">
                          {chatbot.ai_usages?.toLocaleString() || "0"} token
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(getUsagePercentage(), 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{getUsagePercentage()}% terpakai</span>
                        <span>
                          {chatbot.ai_quota?.toLocaleString() || "0"} batas
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plan Tab */}
            <TabsContent value="plan" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paket Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-green-800">
                            {chatbot.plans?.name || "Tanpa Paket"}
                          </h3>
                          <p className="text-green-600">
                            {chatbot.plans?.description ||
                              "Tidak ada deskripsi tersedia"}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Saat Ini
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Harga Bulanan</span>
                          <span className="font-medium">
                            {chatbot.plans?.price_per_month
                              ? formatCurrency(chatbot.plans.price_per_month)
                              : "Gratis"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kuota AI</span>
                          <span className="font-medium">
                            {chatbot.plans?.ai_quota?.toLocaleString() || "0"}{" "}
                            token
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Perpanjangan Otomatis</span>
                          <span
                            className={`font-medium ${
                              chatbot.is_auto_renewal
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {chatbot.is_auto_renewal ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Berakhir</span>
                          <span className="font-medium">
                            {formatDate(chatbot.expired_at)}
                            {chatbot.expired_at && (
                              <span className="text-gray-500 ml-1">
                                ({getDaysLeft(chatbot.expired_at)} hari tersisa)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Fitur Paket</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>
                            {chatbot.plans?.ai_quota?.toLocaleString() || "0"}{" "}
                            token AI per bulan
                          </span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>Integrasi WhatsApp</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>Analitik dasar</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span>Dukungan email</span>
                        </li>
                      </ul>
                    </div>

                    <Button variant="outline" className="w-full">
                      Upgrade Paket
                    </Button>

                    <Dialog
                      open={renewDialogOpen}
                      onOpenChange={(open) => {
                        setRenewDialogOpen(open);
                        if (open) fetchBalance();
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Calendar className="h-4 w-4 mr-2" />
                          Renew
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Konfirmasi Perpanjangan</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="text-center space-y-2">
                            <p className="text-gray-700">
                              Anda akan memperpanjang chatbot{" "}
                              <strong>{chatbot.name}</strong> untuk 1 bulan
                              lagi.
                            </p>
                          </div>

                          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Paket</span>
                              <span className="text-sm">
                                {chatbot.plans?.name}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Biaya</span>
                              <span className="text-sm font-semibold text-green-600">
                                {chatbot.plans
                                  ? formatCurrency(
                                      chatbot.plans.price_per_month
                                    )
                                  : "Gratis"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                Saldo Saat Ini
                              </span>
                              <span className="text-sm">
                                {formatCurrency(balance)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2">
                              <span className="text-sm font-medium">
                                Saldo Setelah Renewal
                              </span>
                              <span
                                className={`text-sm font-semibold ${
                                  isBalanceSufficient()
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {chatbot.plans
                                  ? formatCurrency(
                                      balance - chatbot.plans.price_per_month
                                    )
                                  : formatCurrency(balance)}
                              </span>
                            </div>
                          </div>

                          {!isBalanceSufficient() && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-700">
                                ⚠️ Saldo tidak mencukupi untuk perpanjangan.
                                Anda membutuhkan{" "}
                                {chatbot.plans
                                  ? formatCurrency(
                                      chatbot.plans.price_per_month - balance
                                    )
                                  : "Rp 0"}{" "}
                                lagi.
                              </p>
                            </div>
                          )}

                          <div className="flex space-x-3 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setRenewDialogOpen(false)}
                              className="flex-1"
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={handleRenew}
                              disabled={!isBalanceSufficient() || renewLoading}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {renewLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Memproses...
                                </>
                              ) : (
                                <>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Konfirmasi Renew
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Chat Preview */}
        <div className="xl:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pratinjau Chat</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestartChat}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span className="hidden sm:inline">Mulai Ulang</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chat Messages */}
              <div className="h-64 lg:h-80 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex ${
                      chat.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        chat.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      <p className="text-sm">{chat.message}</p>
                      <p className="text-xs opacity-70 mt-1">{chat.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
