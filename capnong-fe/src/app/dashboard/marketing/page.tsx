"use client";

import { useState, useEffect, useRef } from "react";
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

import { useToast } from "@/components/ui/Toast";
import { generatePosterContent, type PosterContent } from "@/services/api/ai";

type TabType = "caption" | "background" | "creative";

const CAPTION_STYLES = [
  { id: "funny", label: "😄 Hài hước", color: "bg-yellow-50 text-warning dark:bg-yellow-900/20 dark:text-yellow-300" },
  { id: "authentic", label: "🌾 Chân chất", color: "bg-green-50 text-success dark:bg-green-900/20 dark:text-green-300" },
  { id: "professional", label: "💼 Chuyên nghiệp", color: "bg-blue-50 text-info dark:bg-blue-900/20 dark:text-blue-300" },
];

function generateCaptionsLocal(name: string, desc: string) {
  const d = desc || `${name} tươi sạch từ vườn`;
  return {
    funny: `🍊 ${name} vừa hái xong, ${d.toLowerCase()}! Ai chưa thử thì thiệt thòi lắm nha bà con ơi! 😋🔥\n\nMua 3kg tặng 1kg — chỉ có tại Cạp Nông, nhanh tay kẻo hết nha! 💨\n\n#CạpNông #${name.replace(/\s+/g, "")} #NôngSảnSạch`,
    authentic: `🌿 ${name} nhà trồng, ${d.toLowerCase()}. Thu hoạch mỗi sáng, giao tận tay bà con.\n\nChăm bón tự nhiên, không thuốc hóa học. Ăn thử rồi sẽ ghiền!\n\n#CạpNông #TừVườnĐếnBàn #NôngSảnViệt`,
    professional: `📦 ${name.toUpperCase()} — Thu hoạch trực tiếp từ vườn\n✅ ${d}\n✅ Đạt chuẩn VietGAP\n✅ Miễn phí giao hàng đơn >300K\n✅ Đóng gói cẩn thận, giữ tươi 5 ngày\n\n👉 Đặt hàng ngay tại Cạp Nông\n#CạpNông #NôngSảnChấtLượng`,
  };
}

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

/* ─── Template-specific poster renderers (pure inline styles for html2canvas compat) ─── */

function MinimalWhitePoster({ content, posterRef }: { content: PosterContent; posterRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={posterRef} style={{ width: "100%", maxWidth: 384, aspectRatio: "3/4", background: "#FAFAFA", position: "relative", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif", boxShadow: "0 25px 60px rgba(0,0,0,0.12)" }}>
      {/* Top accent line */}
      <div style={{ height: 5, background: "linear-gradient(90deg, #2d6a4f, #95d5b2)" }} />
      {/* Content */}
      <div style={{ padding: "40px 32px", height: "calc(100% - 5px)", display: "flex", flexDirection: "column", textAlign: "center" }}>
        {/* Badges */}
        {content.badgeTexts && content.badgeTexts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 24 }}>
            {content.badgeTexts.map((b, i) => (
              <span key={i} style={{ padding: "4px 14px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", background: "#E8F5E9", color: "#2d6a4f", border: "1px solid #C8E6C9" }}>{b}</span>
            ))}
          </div>
        )}
        {/* Headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15, color: "#1a1a1a", margin: 0, letterSpacing: "-0.02em" }}>{content.headline}</h2>
          {content.tagline && (
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>{content.tagline}</p>
          )}
          {content.priceDisplay && (
            <div style={{ marginTop: 20 }}>
              <span style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, fontSize: 28, fontWeight: 900, background: "#2d6a4f", color: "#fff", letterSpacing: "-0.01em" }}>{content.priceDisplay}</span>
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 24 }}>
          {content.ctaText && (
            <div style={{ display: "inline-block", padding: "12px 32px", borderRadius: 10, fontSize: 13, fontWeight: 800, background: "#1a1a1a", color: "#fff", textTransform: "uppercase", letterSpacing: 1.5 }}>{content.ctaText}</div>
          )}
          {content.shopDisplay && (
            <p style={{ fontSize: 11, color: "#999", marginTop: 12, fontWeight: 600 }}>🏪 {content.shopDisplay}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function WarmHarvestPoster({ content, posterRef }: { content: PosterContent; posterRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={posterRef} style={{ width: "100%", maxWidth: 384, aspectRatio: "3/4", background: "linear-gradient(160deg, #FFF8E1 0%, #FFECB3 30%, #FFE0B2 70%, #FFCC80 100%)", position: "relative", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(230,81,0,0.08)" }} />
      <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(230,81,0,0.06)" }} />
      <div style={{ position: "absolute", top: "40%", left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,152,0,0.1)" }} />
      {/* Accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #E65100, #FF9800, #FFB74D)" }} />
      {/* Content */}
      <div style={{ padding: "44px 28px 32px", height: "100%", display: "flex", flexDirection: "column", textAlign: "center", position: "relative", zIndex: 2 }}>
        {/* Badges */}
        {content.badgeTexts && content.badgeTexts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 20 }}>
            {content.badgeTexts.map((b, i) => (
              <span key={i} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "#E65100", color: "#FFF8E1" }}>{b}</span>
            ))}
          </div>
        )}
        {/* Headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <h2 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.15, color: "#3E2723", margin: 0, letterSpacing: "-0.01em" }}>{content.headline}</h2>
          {content.tagline && (
            <p style={{ fontSize: 13, color: "#5D4037", lineHeight: 1.6, maxWidth: 280, margin: "0 auto", fontStyle: "italic" }}>{content.tagline}</p>
          )}
          {content.priceDisplay && (
            <div style={{ marginTop: 24, position: "relative", display: "inline-block", margin: "24px auto 0" }}>
              <div style={{ position: "absolute", inset: -4, borderRadius: 16, background: "#E65100", opacity: 0.15, filter: "blur(12px)" }} />
              <span style={{ position: "relative", display: "inline-block", padding: "14px 30px", borderRadius: 14, fontSize: 26, fontWeight: 900, background: "linear-gradient(135deg, #E65100, #BF360C)", color: "#fff", transform: "rotate(-1.5deg)", boxShadow: "0 8px 24px rgba(230,81,0,0.3)" }}>{content.priceDisplay}</span>
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          {content.ctaText && (
            <div style={{ display: "inline-block", padding: "14px 36px", borderRadius: 12, fontSize: 13, fontWeight: 800, background: "#3E2723", color: "#FFCC80", textTransform: "uppercase", letterSpacing: 1.5, boxShadow: "0 4px 16px rgba(62,39,35,0.25)" }}>{content.ctaText}</div>
          )}
          {content.shopDisplay && (
            <p style={{ fontSize: 11, color: "#5D4037", marginTop: 14, fontWeight: 700 }}>🛍️ {content.shopDisplay}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FreshGreenPoster({ content, posterRef }: { content: PosterContent; posterRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={posterRef} style={{ width: "100%", maxWidth: 384, aspectRatio: "3/4", background: "linear-gradient(170deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #43A047 100%)", position: "relative", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
      {/* Decorative elements */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", top: "50%", right: -15, width: 60, height: 60, borderRadius: "50%", background: "rgba(165,214,167,0.15)" }} />
      {/* Leaf pattern top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 100%)" }} />
      {/* Content */}
      <div style={{ padding: "44px 28px 32px", height: "100%", display: "flex", flexDirection: "column", textAlign: "center", position: "relative", zIndex: 2 }}>
        {/* Badges */}
        {content.badgeTexts && content.badgeTexts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 20 }}>
            {content.badgeTexts.map((b, i) => (
              <span key={i} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "rgba(255,255,255,0.2)", color: "#fff", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.3)" }}>{b}</span>
            ))}
          </div>
        )}
        {/* Headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.15, color: "#FFFFFF", margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.2)", letterSpacing: "-0.01em" }}>{content.headline}</h2>
          {content.tagline && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>{content.tagline}</p>
          )}
          {content.priceDisplay && (
            <div style={{ marginTop: 24, display: "inline-block", margin: "24px auto 0" }}>
              <span style={{ display: "inline-block", padding: "14px 30px", borderRadius: 14, fontSize: 28, fontWeight: 900, background: "#FFF", color: "#1B5E20", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", transform: "rotate(-2deg)" }}>{content.priceDisplay}</span>
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          {content.ctaText && (
            <div style={{ display: "inline-block", padding: "14px 36px", borderRadius: 12, fontSize: 13, fontWeight: 800, background: "#FFFFFF", color: "#1B5E20", textTransform: "uppercase", letterSpacing: 1.5, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>{content.ctaText}</div>
          )}
          {content.shopDisplay && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 14, fontWeight: 700 }}>🛍️ {content.shopDisplay}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Poster Result Display ─── */
function PosterResultView({ content }: { content: PosterContent }) {
  const posterRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const templateId = content.templateId || "MINIMAL_WHITE";

  const handleDownloadHtml = async () => {
    if (!posterRef.current) return;
    try {
      showToast("info", "Đang xử lý tải ảnh...");
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = `poster_${Date.now()}.png`;
      a.click();
      showToast("success", "Lưu layout thành công!");
    } catch (e) {
      console.error(e);
      showToast("error", "Có lỗi xảy ra khi tạo ảnh.");
    }
  };

  // AI_IMAGE mode — show generated image
  if (content.imageUrl) {
    return (
      <div className="space-y-4">
        <h4 className="font-bold text-lg text-success flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><Check className="w-5 h-5" /> 🎨 Poster AI đã tạo thành công!</span>
          <a href={content.imageUrl} download={`poster_${new Date().getTime()}.png`} className="border border-border px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-background-light flex gap-2 items-center text-foreground transition-colors">
            <Download className="w-4 h-4" /> Tải ảnh
          </a>
        </h4>
        <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.imageUrl} alt="AI Generated Poster" className="w-full object-contain" />
        </div>
        {content.promptUsed && (
          <details className="text-xs text-foreground-muted">
            <summary className="cursor-pointer hover:text-primary">📝 Xem prompt đã được AI tối ưu</summary>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-blue-800 text-xs leading-relaxed">
              {content.promptUsed}
            </div>
          </details>
        )}
      </div>
    );
  }

  // HTML template mode — render based on templateId
  const PosterComponent = templateId === "WARM_HARVEST" ? WarmHarvestPoster
    : templateId === "FRESH_GREEN" ? FreshGreenPoster
    : MinimalWhitePoster;

  return (
    <div className="space-y-4 w-full">
      <h4 className="font-bold text-lg text-success flex items-center justify-between gap-2">
        <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Poster đã tạo thành công!</span>
        <button type="button" onClick={handleDownloadHtml} className="border border-border px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-background-light flex gap-2 items-center text-foreground transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Lưu Layout
        </button>
      </h4>
      <div style={{ display: "flex", justifyContent: "center", padding: 32, background: "#f3f4f6", borderRadius: 16, border: "1px solid #e5e7eb" }}>
        <PosterComponent content={content} posterRef={posterRef} />
      </div>
      <details className="text-xs text-foreground-muted">
        <summary className="cursor-pointer hover:text-primary">Xem dữ liệu thô từ AI</summary>
        <pre className="mt-2 p-3 bg-gray-50 rounded-lg overflow-auto max-h-48 text-[10px]">
          {JSON.stringify(content, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function MarketingLabPage() {
  const [activeTab, setActiveTab] = useState<TabType>("caption");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [captionProvince, setCaptionProvince] = useState("");
  const [captionStyle, setCaptionStyle] = useState<"FUNNY" | "RUSTIC" | "PROFESSIONAL">("FUNNY");
  const [generated, setGenerated] = useState(false);
  const [captionGenerating, setCaptionGenerating] = useState(false);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [bgState, setBgState] = useState<"idle" | "processing" | "done">("idle");
  const [bgInputImage, setBgInputImage] = useState<string | null>(null);
  const [posterTemplate, setPosterTemplate] = useState<string | null>(null);
  const [uploadedPosterImage, setUploadedPosterImage] = useState<string | null>(null);
  
  const [posterProductName, setPosterProductName] = useState("");
  const [posterDescription, setPosterDescription] = useState("");
  const [posterPrice, setPosterPrice] = useState("35.000đ/KG");
  const [posterProvince, setPosterProvince] = useState("Bến Tre");
  const [posterShopName, setPosterShopName] = useState("Cạp Nông Shop");
  
  const { showToast } = useToast();

  // Poster AI state
  const [posterGenerating, setPosterGenerating] = useState(false);
  const [posterResult, setPosterResult] = useState<PosterContent | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [selectedImageModel, setSelectedImageModel] = useState("gemini-2.5-flash-image");

  const IMAGE_MODELS = [
    { id: "gemini-2.5-flash-image", name: "Gemini 2.5 Flash", tag: "Mặc định", price: "$0.30", color: "bg-blue-500" },
    { id: "gemini-3.1-flash-image-preview", name: "Nano Banana 2", tag: "Mới nhất", price: "$0.50", color: "bg-emerald-500" },
    { id: "gemini-3-pro-image-preview", name: "Nano Banana Pro", tag: "Chất lượng cao", price: "$2.00", color: "bg-amber-500" },
    { id: "imagen-4.0-fast-generate-001", name: "Imagen 4 Fast", tag: "Nhanh", price: "$0.02", color: "bg-purple-500" },
    { id: "imagen-4.0-generate-001", name: "Imagen 4", tag: "Cân bằng", price: "$0.04", color: "bg-indigo-500" },
    { id: "imagen-4.0-ultra-generate-001", name: "Imagen 4 Ultra", tag: "Ultra HD", price: "$0.06", color: "bg-rose-500" },
    { id: "grok-imagine-image", name: "Grok Image", tag: "xAI", price: "$0.02", color: "bg-gray-800" },
    { id: "grok-imagine-image-pro", name: "Grok Image Pro", tag: "xAI Pro", price: "$0.07", color: "bg-red-600" },
  ];

  const handleGenerate = async () => {
    if (!productName.trim()) {
      showToast("error", "Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!productDesc.trim()) {
      showToast("error", "Vui lòng nhập mô tả ngắn gọn (Bắt buộc để AI viết caption)!");
      return;
    }
    
    setCaptionGenerating(true);
    setGenerated(false);
    try {
      const { generateCaptions } = await import("@/services/api/ai");
      const res = await generateCaptions({
        productName,
        description: productDesc,
        province: captionProvince,
        style: captionStyle,
      });

      const mapped: Record<string, string> = {};
      res.forEach(item => {
        const lowerStyle = (item.style || "funny").toLowerCase();
        let uiKey = "funny";
        if (lowerStyle.includes("rustic") || lowerStyle.includes("authentic")) uiKey = "authentic";
        if (lowerStyle.includes("pro") || lowerStyle.includes("chuyên")) uiKey = "professional";

        const tags = Array.isArray(item.hashtags) ? item.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(" ") : "";
        mapped[uiKey] = `${item.text}\n\n${tags}`;
      });

      // Nếu backend trả về thiếu, xài local mock đắp vô
      const localFallback = generateCaptionsLocal(productName, productDesc);
      setCaptions({ ...localFallback, ...mapped });
      setGenerated(true);
      showToast("success", "Tạo caption thành công!");
    } catch (e) {
      console.error(e);
      showToast("error", "AI đang bận hoặc có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setCaptionGenerating(false);
    }
  };

  const handleCopy = (style: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(style);
    setTimeout(() => setCopied(null), 2000);
  };

  /* ─── Poster GenAI Handler ─── */
  const handleGeneratePoster = async () => {
    if (!posterProductName.trim()) {
      showToast("error", "Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!posterTemplate) {
      showToast("error", "Vui lòng chọn template ấn phẩm!");
      return;
    }

    setPosterGenerating(true);
    setPosterResult(null);
    setPosterError(null);

    try {
      const isAiImage = posterTemplate === "ai_image";
      const templateMap: Record<string, string> = {
        minimal: "MINIMAL_WHITE",
        vibrant: "WARM_HARVEST",
        pro: "FRESH_GREEN",
      };

      const parsedPrice = parseInt(posterPrice.replace(/\D/g, ""), 10) || 35000;
      const unitCode = posterPrice.split("/")[1] || "KG";

      const result = await generatePosterContent({
        productName: posterProductName,
        description: posterDescription || posterProductName,
        pricePerUnit: parsedPrice,
        unitCode: unitCode,
        shopName: posterShopName,
        province: posterProvince,
        bgRemovedImageUrl: uploadedPosterImage || undefined,
        mode: isAiImage ? "AI_IMAGE" : "HTML",
        templateId: isAiImage ? undefined : (templateMap[posterTemplate] || "FRESH_GREEN"),
        imageModel: isAiImage ? selectedImageModel : undefined,
      });

      setPosterResult(result);
    } catch (err) {
      console.error("Poster generation error:", err);
      setPosterError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo poster");
    } finally {
      setPosterGenerating(false);
    }
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
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Quay lại Dashboard">
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground">🎨 AI Marketing Lab</h1>
          <p className="text-sm text-foreground-muted">Tạo nội dung marketing chuyên nghiệp cho nông sản bằng AI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white border border-border text-foreground-muted hover:border-primary"
            }`}>
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
                <label htmlFor="caption-product-name" className="block text-sm font-medium mb-2">Tên sản phẩm</label>
                <input id="caption-product-name" type="text" value={productName}
                  placeholder="Nhập tên sản phẩm"
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label htmlFor="caption-product-desc" className="block text-sm font-medium mb-2">Mô tả ngắn (bắt buộc)</label>
                <input id="caption-product-desc" type="text" value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Ví dụ: Cam vừa hái vườn, ngọt lịm, thịt mọng"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="caption-province" className="block text-sm font-medium mb-2">Tỉnh / Vùng miền (tùy chọn)</label>
                  <input id="caption-province" type="text" value={captionProvince}
                    onChange={(e) => setCaptionProvince(e.target.value)}
                    placeholder="Ví dụ: Vĩnh Long, Miền Tây..."
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                </div>
                <div>
                  <label htmlFor="caption-style" className="block text-sm font-medium mb-2">Phong cách Caption</label>
                  <select id="caption-style" value={captionStyle}
                    onChange={(e) => setCaptionStyle(e.target.value as any)}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white dark:bg-background">
                    <option value="FUNNY">😄 Hài hước & Gần gũi</option>
                    <option value="RUSTIC">🌾 Chân chất nông dân</option>
                    <option value="PROFESSIONAL">💼 Khách mời / Chuyên nghiệp</option>
                  </select>
                </div>
              </div>
              <button type="button" onClick={handleGenerate} disabled={captionGenerating || !productName.trim()}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {captionGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> AI đang viết caption...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Viết caption bằng AI</>
                )}
              </button>
            </div>
          </div>
          {generated && (
            <div className="space-y-4">
              {CAPTION_STYLES.map((style) => {
                const text = captions[style.id] || "";
                return (
                  <div key={style.id} className="bg-white dark:bg-surface border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.color}`}>{style.label}</span>
                      <button type="button" onClick={() => handleCopy(style.id, text)}
                        className="text-xs text-foreground-muted hover:text-primary flex items-center gap-1 transition-colors">
                        {copied === style.id ? (<><Check className="w-3.5 h-3.5 text-success" /> Đã copy!</>) : (<><Copy className="w-3.5 h-3.5" /> Copy</>)}
                      </button>
                    </div>
                    <p className="text-sm whitespace-pre-line text-foreground leading-relaxed">{text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Background Remover */}
      {activeTab === "background" && (
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Tách nền ảnh sản phẩm</h3>
          <div className="border border-dashed border-border rounded-xl p-12 text-center bg-gray-50/50 dark:bg-background-light">
            <span className="text-4xl block mb-4">🚧</span>
            <h4 className="font-bold text-foreground mb-2">Chức năng đang được xây dựng</h4>
            <p className="text-sm text-foreground-muted max-w-sm mx-auto">
              Tính năng tách nền WebAssembly trực tiếp trên trình duyệt hiện đang trong quá trình phát triển và sẽ sớm được ra mắt trong bản cập nhật tiếp theo.
            </p>
          </div>
        </div>
      )}

      {/* Ad Creative — Poster Templates */}
      {activeTab === "creative" && (
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Tạo ấn phẩm quảng cáo bằng AI</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="marketing-product-name" className="block text-sm font-medium mb-2">Tên sản phẩm (Bắt buộc)</label>
                <input id="marketing-product-name" type="text" value={posterProductName}
                  placeholder="Nhập tên sản phẩm"
                  onChange={(e) => setPosterProductName(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label htmlFor="marketing-description" className="block text-sm font-medium mb-2">Mô tả định hướng (Bắt buộc)</label>
                <input id="marketing-description" type="text" value={posterDescription}
                  placeholder="Ví dụ: trái to, đỏ mọng, phù hợp biếu tặng..."
                  onChange={(e) => setPosterDescription(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="marketing-province" className="block text-sm font-medium mb-2">Tỉnh/Thành</label>
                  <input id="marketing-province" type="text" value={posterProvince}
                    onChange={(e) => setPosterProvince(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl outline-none" />
                </div>
                <div>
                  <label htmlFor="marketing-price" className="block text-sm font-medium mb-2">Giá hiển thị</label>
                  <input id="marketing-price" type="text" value={posterPrice}
                    onChange={(e) => setPosterPrice(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl outline-none" />
                </div>
                <div>
                  <label htmlFor="marketing-shop" className="block text-sm font-medium mb-2">Tên cửa hàng</label>
                  <input id="marketing-shop" type="text" value={posterShopName}
                    onChange={(e) => setPosterShopName(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Chọn template poster (bắt buộc)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Minimal White */}
                  <button type="button" onClick={() => setPosterTemplate("minimal")}
                    className={`relative p-0 rounded-xl border-2 overflow-hidden transition-all ${posterTemplate === "minimal" ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-gray-300 hover:border-primary/50"}`}>
                    <div className="h-36 flex flex-col items-center justify-center p-3" style={{ background: "#FAFAFA" }}>
                      <div style={{ width: "100%", borderTop: "3px solid #2d6a4f", marginBottom: 8 }} />
                      <span style={{ fontSize: 8, fontWeight: 900, color: "#1a1a1a", letterSpacing: -0.3 }}>ỔI VĨNH LONG</span>
                      <span style={{ fontSize: 6, color: "#666", marginTop: 2 }}>Giòn ngọt tự nhiên</span>
                      <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", background: "#2d6a4f", borderRadius: 4, padding: "2px 8px", marginTop: 6 }}>35.000đ</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-surface text-center border-t border-gray-100">
                      <span className="text-xs font-bold">✨ Tối giản</span>
                      <p className="text-[10px] text-foreground-muted mt-0.5">Nền trắng, typography sạch</p>
                    </div>
                    {posterTemplate === "minimal" && (<div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>)}
                  </button>

                  {/* Warm Harvest */}
                  <button type="button" onClick={() => setPosterTemplate("vibrant")}
                    className={`relative p-0 rounded-xl border-2 overflow-hidden transition-all ${posterTemplate === "vibrant" ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-orange-300 hover:border-primary/50"}`}>
                    <div className="h-36 flex flex-col items-center justify-center p-3" style={{ background: "linear-gradient(160deg, #FFF8E1, #FFECB3, #FFE0B2)" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(230,81,0,0.08)", position: "absolute", top: 8, right: 8 }} />
                      <span style={{ fontSize: 7, fontWeight: 800, color: "#FFF8E1", background: "#E65100", borderRadius: 999, padding: "2px 8px", marginBottom: 6 }}>HÁI TẬN VƯỜN</span>
                      <span style={{ fontSize: 8, fontWeight: 900, color: "#3E2723", letterSpacing: -0.3 }}>ỔI VĨNH LONG</span>
                      <span style={{ fontSize: 6, color: "#5D4037", marginTop: 2, fontStyle: "italic" }}>Hương vị quê nhà</span>
                      <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", background: "linear-gradient(135deg, #E65100, #BF360C)", borderRadius: 6, padding: "2px 8px", marginTop: 6, transform: "rotate(-1.5deg)", display: "inline-block" }}>35.000đ</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-surface text-center border-t border-orange-100">
                      <span className="text-xs font-bold">🎨 Sống động</span>
                      <p className="text-[10px] text-foreground-muted mt-0.5">Màu nóng, phong cách mùa vụ</p>
                    </div>
                    {posterTemplate === "vibrant" && (<div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>)}
                  </button>

                  {/* Fresh Green */}
                  <button type="button" onClick={() => setPosterTemplate("pro")}
                    className={`relative p-0 rounded-xl border-2 overflow-hidden transition-all ${posterTemplate === "pro" ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-green-600 hover:border-primary/50"}`}>
                    <div className="h-36 flex flex-col items-center justify-center p-3" style={{ background: "linear-gradient(170deg, #1B5E20, #2E7D32, #43A047)" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", position: "absolute", top: 6, right: 6 }} />
                      <span style={{ fontSize: 7, fontWeight: 800, color: "#fff", background: "rgba(255,255,255,0.2)", borderRadius: 999, padding: "2px 8px", marginBottom: 6, border: "1px solid rgba(255,255,255,0.3)" }}>NÔNG SẢN SẠCH</span>
                      <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: -0.3, textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>ỔI VĨNH LONG</span>
                      <span style={{ fontSize: 6, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Tươi mới mỗi ngày</span>
                      <span style={{ fontSize: 8, fontWeight: 900, color: "#1B5E20", background: "#fff", borderRadius: 6, padding: "2px 8px", marginTop: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transform: "rotate(-2deg)", display: "inline-block" }}>35.000đ</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-surface text-center border-t border-green-100">
                      <span className="text-xs font-bold">🌿 Tự nhiên</span>
                      <p className="text-[10px] text-foreground-muted mt-0.5">Nền xanh, nổi bật sản phẩm</p>
                    </div>
                    {posterTemplate === "pro" && (<div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>)}
                  </button>

                  {/* AI Image */}
                  <button type="button" onClick={() => setPosterTemplate("ai_image")}
                    className={`relative p-0 rounded-xl border-2 overflow-hidden transition-all ${posterTemplate === "ai_image" ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "border-purple-400 hover:border-primary/50"}`}>
                    <div className="h-36 flex flex-col items-center justify-center p-3" style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)" }}>
                      <span style={{ fontSize: 28, marginBottom: 4 }}>🤖</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>AI GENERATE</span>
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Gemini / Imagen / Grok</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-surface text-center border-t border-purple-100">
                      <span className="text-xs font-bold">🖼️ AI tạo ảnh</span>
                      <p className="text-[10px] text-foreground-muted mt-0.5">AI tự vẽ poster hoàn chỉnh</p>
                    </div>
                    {posterTemplate === "ai_image" && (<div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"><Check className="w-3 h-3" /></div>)}
                  </button>
                </div>
              </div>

              {/* Model selector — only when AI tạo ảnh selected */}
              {posterTemplate === "ai_image" && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                  <label className="block text-sm font-bold mb-3 text-purple-800">🤖 Chọn model AI tạo ảnh</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {IMAGE_MODELS.map((m) => (
                      <button type="button" key={m.id} onClick={() => setSelectedImageModel(m.id)}
                        className={`relative text-left p-3 rounded-lg border-2 transition-all ${selectedImageModel === m.id
                          ? "border-purple-500 bg-white shadow-md ring-2 ring-purple-200"
                          : "border-gray-200 bg-white/60 hover:border-purple-300"}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${m.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{m.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">{m.tag}</span>
                              <span className="text-[10px] text-gray-500">{m.price}</span>
                            </div>
                          </div>
                        </div>
                        {selectedImageModel === m.id && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-purple-500 text-white rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image upload — chỉ hiển thị khi chọn AI tạo ảnh */}
              {posterTemplate === "ai_image" && (
              <div>
                <label htmlFor="poster-image-upload" className="block text-sm font-medium mb-2">Ảnh sản phẩm (AI sẽ dùng làm tư liệu)</label>
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer relative"
                  onClick={() => document.getElementById("poster-image-upload")?.click()}
                >
                  <input 
                    id="poster-image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setUploadedPosterImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {uploadedPosterImage ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploadedPosterImage} alt="preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-foreground-muted">Kéo thả hoặc click để chọn ảnh</p>
                      <p className="text-[10px] text-gray-400 mt-1">Nên dùng ảnh đã tách nền bên tab Tách Nền AI</p>
                    </>
                  )}
                </div>
              </div>
              )}

              <button type="button" disabled={!posterTemplate || posterGenerating} onClick={handleGeneratePoster}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
                {posterGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> AI đang tạo poster...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Tạo ấn phẩm bằng GenAI</>
                )}
              </button>
              <p className="text-xs text-foreground-muted text-center">
                Quá trình này có thể kéo dài lên đến 1 phút.
              </p>
            </div>
          </div>

          {/* Error */}
          {posterError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <p className="font-bold">❌ Lỗi tạo poster</p>
              <p className="mt-1">{posterError}</p>
            </div>
          )}

          {/* Result */}
          {posterResult && <PosterResultView content={posterResult} />}
        </div>
      )}
    </div>
  );
}
