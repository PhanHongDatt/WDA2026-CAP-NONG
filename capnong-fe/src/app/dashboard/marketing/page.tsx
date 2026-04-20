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

/* ─── Poster Result Display ─── */
function PosterResultView({ content }: { content: PosterContent }) {
  const posterRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const cs = content.colorScheme || { primary: "#FFFFFF", accent: "#A5D6A7", text_on_primary: "#333333", background: "#FFFFFF", textOnPrimary: "#333333" } as any;
  const bgColor = cs.background || cs.primary || "#FFFFFF";
  const textColor = cs.text_on_primary || cs.textOnPrimary || "#333333";
  const accentColor = cs.accent || "#A5D6A7";

  const handleDownloadHtml = async () => {
    if (!posterRef.current) return;
    try {
      showToast("info", "Đang xử lý tải ảnh...");
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true, backgroundColor: bgColor });
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

  // HTML template mode
  return (
    <div className="space-y-4 w-full">
      <h4 className="font-bold text-lg text-success flex items-center justify-between gap-2">
        <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Poster đã tạo thành công!</span>
        <button type="button" onClick={handleDownloadHtml} className="border border-border px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-background-light flex gap-2 items-center text-foreground transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Lưu Layout
        </button>
      </h4>
      <div className="flex justify-center bg-gray-50 dark:bg-background-light border border-border p-8 rounded-2xl overflow-hidden">
        <div
          ref={posterRef}
          className="w-full max-w-sm mx-auto overflow-hidden shadow-2xl relative"
          style={{ background: bgColor, aspectRatio: "3/4" }}
        >
          {/* Background Decorators */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 20% 30%, ${accentColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${textColor} 0%, transparent 40%)` }} />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
          
          <div className="p-8 h-full flex flex-col relative z-10 text-center">
            {/* Top Badges */}
            {content.badgeTexts && content.badgeTexts.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-10 mt-4">
                {content.badgeTexts.map((badge, i) => (
                  <span key={i} className="px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5"
                    style={{ background: accentColor, color: textColor }}>
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Center Content */}
            <div className="space-y-6 my-auto pt-4 pb-8 flex-1 flex flex-col justify-center">
              <h2 className="text-4xl sm:text-5xl font-black leading-[1.1] drop-shadow-sm tracking-tight"
                style={{ color: textColor }}>
                {content.headline}
              </h2>
              {content.tagline && (
                <p className="text-sm font-medium mx-auto max-w-[280px] leading-relaxed" style={{ color: textColor, opacity: 0.85 }}>
                  {content.tagline}
                </p>
              )}
              {content.priceDisplay && (
                <div className="inline-block mt-8 relative group mx-auto">
                  <div className="absolute inset-0 blur-lg opacity-40 scale-110" style={{ background: accentColor }} />
                  <div className="px-6 py-3 rounded-2xl text-2xl font-black shadow-lg transform -rotate-2 relative ring-2 ring-black/5"
                    style={{ background: accentColor, color: textColor }}>
                    {content.priceDisplay}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div className="space-y-4 mt-auto mb-4">
              {content.ctaText && (
                <div className="px-8 py-3.5 rounded-xl font-black text-sm mx-auto inline-block shadow-lg uppercase tracking-wider"
                  style={{ background: textColor, color: bgColor }}>
                  {content.ctaText}
                </div>
              )}
              {content.shopDisplay && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold pt-2 opacity-80" style={{ color: textColor }}>
                  <span className="w-5 h-5 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.05)" }}>🛍️</span> 
                  {content.shopDisplay}
                </div>
              )}
            </div>
          </div>
        </div>
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
                  {[
                    { id: "minimal", label: "Tối giản", emoji: "✨", bg: "bg-white", accent: "border-gray-300", desc: "Nền trắng, typography sạch, focus vào sản phẩm" },
                    { id: "vibrant", label: "Sống động", emoji: "🎨", bg: "bg-gradient-to-br from-orange-100 to-yellow-50", accent: "border-orange-300", desc: "Màu nóng, dynamic layout, bong bóng trang trí" },
                    { id: "pro", label: "Chuyên nghiệp", emoji: "💼", bg: "bg-gradient-to-br from-gray-800 to-gray-900", accent: "border-gray-600", desc: "Nền tối, gold accent, dành cho B2B" },
                    { id: "ai_image", label: "🤖 AI tạo ảnh", emoji: "🖼️", bg: "bg-gradient-to-br from-purple-500 to-indigo-600", accent: "border-purple-400", desc: "Gemini tự vẽ poster, không dùng template" },
                  ].map((tmpl) => (
                    <button type="button" key={tmpl.id} onClick={() => setPosterTemplate(tmpl.id)}
                      className={`relative p-0 rounded-xl border-2 overflow-hidden transition-all ${posterTemplate === tmpl.id ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : `${tmpl.accent} hover:border-primary/50`}`}>
                      <div className={`${tmpl.bg} h-32 flex flex-col items-center justify-center p-3`}>
                        <span className="text-3xl mb-1">{tmpl.emoji}</span>
                        <span className={`text-[10px] font-bold ${tmpl.id === "pro" || tmpl.id === "ai_image" ? "text-white" : "text-gray-600"}`}>{tmpl.id === "ai_image" ? "AI GENERATE" : "CAM SÀNH BẾN TRE"}</span>
                        <span className={`text-[8px] ${tmpl.id === "pro" || tmpl.id === "ai_image" ? "text-gray-300" : "text-gray-500"}`}>{tmpl.id === "ai_image" ? "Gemini 2.5 Flash" : "35.000đ/kg"}</span>
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
