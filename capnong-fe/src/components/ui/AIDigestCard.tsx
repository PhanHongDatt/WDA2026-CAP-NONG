"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  CloudRain,
  TrendingUp,
  Lightbulb,
  Sprout,
  ArrowRight,
  Loader2,
  RefreshCw,
  CloudSun,
  AlertTriangle,
} from "lucide-react";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "/fastapi";

interface ProactiveNotification {
  type: string;
  title: string;
  message: string;
  priority: string;
  action_url?: string;
}

interface DigestResponse {
  notifications: ProactiveNotification[];
  weather_summary?: string;
  province: string;
}

function typeIcon(type: string) {
  switch (type) {
    case "WEATHER_ALERT":
      return <CloudRain className="w-5 h-5" />;
    case "PRICE_TREND":
      return <TrendingUp className="w-5 h-5" />;
    case "HARVEST_TIP":
      return <Sprout className="w-5 h-5" />;
    case "MARKET_OPPORTUNITY":
      return <Lightbulb className="w-5 h-5" />;
    default:
      return <Bot className="w-5 h-5" />;
  }
}

function typeColor(type: string, priority: string) {
  if (priority === "high") return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50";
  switch (type) {
    case "WEATHER_ALERT":
      return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50";
    case "PRICE_TREND":
      return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50";
    case "HARVEST_TIP":
      return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50";
    case "MARKET_OPPORTUNITY":
      return "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50";
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700/50";
  }
}

interface AIDigestCardProps {
  province?: string;
  farmerName?: string;
  products?: string[];
}

/**
 * AI Digest Card — "Bản tin AI hôm nay"
 * Hiển thị thông báo chủ động dựa trên thời tiết + giá thị trường
 */
export default function AIDigestCard({ province = "Tiền Giang", farmerName, products = [] }: AIDigestCardProps) {
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const CACHE_KEY = `capnong_ai_digest_${farmerName || "guest"}`;
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

  const fetchDigest = async (forceRefresh = false) => {
    setLoading(true);
    setError(false);
    try {
      if (!forceRefresh && typeof window !== "undefined") {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
              setDigest(data);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Ignore invalid cache
          }
        }
      }
      const resp = await fetch(`${AI_SERVICE_URL}/ai/proactive-digest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          province,
          farmer_name: farmerName || undefined,
          products,
        }),
      });
      if (!resp.ok) throw new Error("API error");
      const data: DigestResponse = await resp.json();
      setDigest(data);
      
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province]);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-900/10 dark:via-surface dark:to-blue-900/10 border border-emerald-200/60 dark:border-emerald-800/30 rounded-2xl shadow-sm overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-blue-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm">🤖 Trợ lý AI nhắc nhở</h3>
            {digest?.weather_summary && (
              <p className="text-xs text-foreground-muted flex items-center gap-1 mt-0.5">
                <CloudSun className="w-3 h-3" />
                {digest.weather_summary}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDigest(true)}
            disabled={loading}
            className="p-1.5 text-foreground-muted hover:text-primary transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-surface"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-foreground-muted hover:text-foreground transition-colors"
          >
            Ẩn
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 relative z-10">
        {loading && (
          <div className="flex items-center justify-center py-6 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-foreground-muted">AI đang phân tích thời tiết và thị trường...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-3 py-4 text-sm text-foreground-muted">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Không thể kết nối AI Service. <button onClick={() => fetchDigest(true)} className="text-primary font-bold hover:underline">Thử lại</button></span>
          </div>
        )}

        {digest && !loading && (
          <div className="space-y-3">
            {digest.notifications.map((n, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm ${typeColor(n.type, n.priority)}`}
              >
                <div className="shrink-0 mt-0.5">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{n.title}</p>
                  <p className="text-sm opacity-90 mt-0.5">{n.message}</p>
                  {n.action_url && (
                    <Link
                      href={n.action_url}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-bold hover:underline"
                    >
                      Hành động ngay <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {digest.notifications.length === 0 && (
              <div className="text-center py-4 text-sm text-foreground-muted">
                <Sprout className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Hôm nay không có cảnh báo đặc biệt. Chúc bác buôn bán tốt! 🌿
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
