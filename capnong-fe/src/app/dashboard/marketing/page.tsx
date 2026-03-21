"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  ImageOff,
  Palette,
  Sparkles,
  Copy,
  Check,
  Upload,
  Loader2,
  Download,
} from "lucide-react";

type TabType = "caption" | "background" | "creative";

const CAPTION_STYLES = [
  { id: "funny", label: "😄 Hài hước", color: "bg-yellow-50 text-warning" },
  { id: "authentic", label: "🌾 Chân chất", color: "bg-green-50 text-success" },
  { id: "professional", label: "💼 Chuyên nghiệp", color: "bg-blue-50 text-info" },
];

const MOCK_CAPTIONS = {
  funny:
    "🍊 Cam sành Bến Tre vừa hái xong, ngọt lịm tim! Ai chưa thử thì thiệt thòi lắm nha bà con ơi! 😋🔥\n\n#CạpNông #CamSànhBếnTre #NôngSảnSạch",
  authentic:
    "🌿 Cam sành nhà trồng ở đất Bến Tre, chăm bón tự nhiên, không thuốc. Thu hoạch mỗi sáng, giao tận tay bà con. Ăn thử rồi sẽ ghiền!\n\n#CạpNông #TừVườnĐếnBàn",
  professional:
    "📦 CAM SÀNH BẾN TRE — Thu hoạch trực tiếp từ vườn\n✅ Đạt chuẩn VietGAP\n✅ Cam tươi trong ngày\n✅ Miễn phí giao hàng đơn >300K\n\n👉 Đặt hàng ngay tại Cạp Nông\n#CạpNông #NôngSảnChấtLượng",
};

function ProcessingSimulator({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="text-center py-12">
      <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
      <p className="font-bold text-sm">AI đang tách nền...</p>
      <p className="text-xs text-foreground-muted mt-1">
        Xử lý ngay trên trình duyệt bằng WebAssembly
      </p>
    </div>
  );
}

export default function MarketingLabPage() {
  const [activeTab, setActiveTab] = useState<TabType>("caption");
  const [productName, setProductName] = useState("Cam Sành Bến Tre");
  const [captionStyle, setCaptionStyle] = useState("funny");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [bgState, setBgState] = useState<"idle" | "processing" | "done">("idle");
  const [posterTemplate, setPosterTemplate] = useState<string | null>(null);

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleCopy = (style: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(style);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { id: "caption" as TabType, label: "Caption Facebook", icon: MessageSquare },
    { id: "background" as TabType, label: "Tách nền ảnh", icon: ImageOff },
    { id: "creative" as TabType, label: "Ấn phẩm quảng cáo", icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Quay lại Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground">
            🎨 AI Marketing Lab
          </h1>
          <p className="text-sm text-foreground-muted">
            Tạo nội dung marketing chuyên nghiệp cho nông sản bằng AI
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white border border-border text-foreground-muted hover:border-primary"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Caption Generator */}
      {activeTab === "caption" && (
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Tạo Caption Facebook</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="caption-product-name" className="block text-sm font-medium mb-2">
                  Tên sản phẩm
                </label>
                <input
                  id="caption-product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label htmlFor="caption-product-desc" className="block text-sm font-medium mb-2">
                  Mô tả ngắn (tùy chọn)
                </label>
                <input
                  id="caption-product-desc"
                  type="text"
                  placeholder="Ví dụ: Cam vừa hái vườn, ngọt lịm"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <button type="button"
                onClick={handleGenerate}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Tạo 3 caption bằng AI
              </button>
            </div>
          </div>

          {generated && (
            <div className="space-y-4">
              {CAPTION_STYLES.map((style) => (
                <div
                  key={style.id}
                  className="bg-white border border-border rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${style.color}`}
                    >
                      {style.label}
                    </span>
                    <button type="button"
                      onClick={() =>
                        handleCopy(
                          style.id,
                          MOCK_CAPTIONS[style.id as keyof typeof MOCK_CAPTIONS]
                        )
                      }
                      className="text-xs text-foreground-muted hover:text-primary flex items-center gap-1"
                    >
                      {copied === style.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-success" />
                          Đã copy!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm whitespace-pre-line text-foreground leading-relaxed">
                    {MOCK_CAPTIONS[style.id as keyof typeof MOCK_CAPTIONS]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Background Remover */}
      {activeTab === "background" && (
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Tách nền ảnh sản phẩm</h3>

          {bgState === "idle" && (
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => setBgState("processing")}
            >
              <Upload className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
              <p className="font-medium text-sm">
                Kéo thả hoặc nhấn để tải ảnh sản phẩm
              </p>
              <p className="text-xs text-foreground-muted mt-1">
                PNG, JPG, WEBP • Tối đa 5MB
              </p>
              <p className="text-xs text-primary font-bold mt-3">
                ✨ AI tự động tách nền bằng WASM — không tốn server
              </p>
            </div>
          )}

          {bgState === "processing" && (
            <ProcessingSimulator onDone={() => setBgState("done")} />
          )}

          {bgState === "done" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-100 aspect-square flex items-center justify-center text-4xl">
                  🍊
                </div>
                <div
                  className="rounded-xl aspect-square flex items-center justify-center text-4xl checkerboard-bg"
                >
                  🍊
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" className="flex-1 bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-light transition-colors">
                  <Download className="w-4 h-4" />
                  Tải ảnh đã tách nền
                </button>
                <button type="button"
                  onClick={() => setBgState("idle")}
                  className="border border-border px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Ảnh khác
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ad Creative — 3 Poster Templates */}
      {activeTab === "creative" && (
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">
              Tạo ấn phẩm quảng cáo bằng AI
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="marketing-product-name" className="block text-sm font-medium mb-2">
                  Tên sản phẩm
                </label>
                <input
                  id="marketing-product-name"
                  type="text"
                  defaultValue="Cam Sành Bến Tre"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">
                  Chọn template poster (bắt buộc)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "minimal", label: "Tối giản", emoji: "✨", bg: "bg-white", accent: "border-gray-300", desc: "Nền trắng, typography sạch, focus vào sản phẩm" },
                    { id: "vibrant", label: "Sống động", emoji: "🎨", bg: "bg-gradient-to-br from-orange-100 to-yellow-50", accent: "border-orange-300", desc: "Màu nóng, dynamic layout, bong bóng trang trí" },
                    { id: "pro", label: "Chuyên nghiệp", emoji: "💼", bg: "bg-gradient-to-br from-gray-800 to-gray-900", accent: "border-gray-600", desc: "Nền tối, gold accent, dành cho B2B" },
                  ].map((tmpl) => (
                    <button type="button"
                      key={tmpl.id}
                      onClick={() => setPosterTemplate(tmpl.id)}
                      className={`relative p-0 rounded-xl border-2 overflow-hidden transition-all ${posterTemplate === tmpl.id ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : `${tmpl.accent} hover:border-primary/50`}`}
                    >
                      {/* Mini poster preview */}
                      <div className={`${tmpl.bg} h-32 flex flex-col items-center justify-center p-3`}>
                        <span className="text-3xl mb-1">{tmpl.emoji}</span>
                        <span className={`text-[10px] font-bold ${tmpl.id === "pro" ? "text-yellow-400" : "text-gray-600"}`}>CAM SÀNH BẾN TRE</span>
                        <span className={`text-[8px] ${tmpl.id === "pro" ? "text-gray-400" : "text-gray-500"}`}>35.000đ/kg</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-surface text-center">
                        <span className="text-xs font-bold">{tmpl.label}</span>
                        <p className="text-[10px] text-foreground-muted mt-0.5">{tmpl.desc}</p>
                      </div>
                      {posterTemplate === tmpl.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="marketing-upload" className="block text-sm font-medium mb-2">
                  Ảnh sản phẩm (để AI tách nền)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-foreground-muted">Kéo thả hoặc click để chọn ảnh</p>
                </div>
              </div>

              <button type="button" disabled={!posterTemplate} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
                <Sparkles className="w-5 h-5" />
                Tạo ấn phẩm bằng GenAI
              </button>
              <p className="text-xs text-foreground-muted text-center">
                AI sẽ tách nền → generate nội dung → map vào template → xuất file PNG (html2canvas)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
