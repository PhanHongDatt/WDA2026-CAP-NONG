"use client";

import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, CheckCircle2 } from "lucide-react";
import type { VoiceProductResult } from "@/components/ui/VoiceRecorder";
import { productService } from "@/services";
import { useToast } from "@/components/ui/Toast";

// Lazy-load heavy AI components — not needed in initial bundle
const VoiceRecorder = lazy(() => import("@/components/ui/VoiceRecorder"));
const AIRefiner = lazy(() => import("@/components/ui/AIRefiner"));
const PriceAdvisor = lazy(() => import("@/components/ui/PriceAdvisor"));

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [_images, _setImages] = useState<string[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ── Form fields (controlled) ── */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("KG");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("FRUIT");
  const [location, setLocation] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [farmingMethod, setFarmingMethod] = useState("ORGANIC");

  /* ── Voice state ── */
  const [voiceFilled, setVoiceFilled] = useState(false);
  const [voiceConfidence, setVoiceConfidence] = useState<Record<string, number>>({});
  const [voiceTranscript, setVoiceTranscript] = useState("");

  /* Auto-fill form from voice AI result */
  const handleVoiceResult = (result: VoiceProductResult) => {
    if (result.name) setName(result.name);
    if (result.description) setDescription(result.description);
    if (result.price > 0) setPrice(String(result.price));
    if (result.unit) setUnit(result.unit);
    if (result.quantity > 0) setQuantity(String(result.quantity));
    if (result.location) setLocation(result.location);
    if (result.harvestDate) setHarvestDate(result.harvestDate);
    if (result.farmingMethod) setFarmingMethod(result.farmingMethod);
    setVoiceConfidence(result.confidence);
    setVoiceTranscript(result.transcript);
    setVoiceFilled(true);
  };

  /* Confidence-based border styling */
  const fieldClass = (fieldId: string) => {
    if (!voiceFilled) return "border-border";
    const conf = voiceConfidence[fieldId] ?? 1;
    if (conf < 0.5) return "border-red-400 ring-2 ring-red-200 bg-red-50/30";
    if (conf < 0.7) return "border-yellow-400 ring-2 ring-yellow-200 bg-yellow-50/30";
    return "border-primary/40 bg-primary/5";
  };

  const confidenceBadge = (fieldId: string) => {
    if (!voiceFilled) return null;
    const conf = voiceConfidence[fieldId];
    if (conf === undefined || conf === 0) return null;
    const pct = Math.round(conf * 100);
    const color = conf < 0.5 ? "text-red-600 bg-red-50" : conf < 0.7 ? "text-yellow-600 bg-yellow-50" : "text-primary bg-primary/10";
    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 ${color}`}>
        AI {pct}%
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 dark:hover:bg-background-light rounded-full transition-colors"
          aria-label="Quay lại Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Đăng sản phẩm mới
          </h1>
          <p className="text-sm text-foreground-muted">
            Điền thông tin sản phẩm hoặc dùng giọng nói AI để tự động điền
          </p>
        </div>
      </div>

      {/* Voice-to-Product — lazy loaded */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-48 bg-primary/5 border border-primary/20 rounded-xl animate-pulse flex items-center justify-center text-sm text-foreground-muted">Đang tải Voice AI...</div>}>
          <VoiceRecorder onResult={handleVoiceResult} />
        </Suspense>
      </div>

      {/* Confidence warning */}
      {voiceFilled && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl">
           <div className="flex items-start gap-3">
            <div>
              <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-1">
                AI đã tự động điền form từ giọng nói
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Các field viền <strong className="text-red-600">đỏ</strong> (confidence &lt; 50%) và <strong className="text-yellow-600">vàng</strong> (&lt; 70%) cần kiểm tra kỹ.
                Field viền <strong className="text-primary">xanh</strong> có độ tin cậy cao.
              </p>
              {voiceTranscript && (
                <p className="text-xs text-yellow-600/80 mt-2 italic">
                  🗣️ Bạn nói: &quot;{voiceTranscript}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form className="space-y-6" onSubmit={async (e) => {
        e.preventDefault();
        if (!name || !price || !quantity) {
          setSubmitError("Vui lòng điền tên, giá và sản lượng.");
          return;
        }
        setSubmitError(null);
        setSubmittingProduct(true);
        try {
          if (productService.createProduct) {
            await productService.createProduct({
              name,
              description,
              category,
              unitCode: unit,
              pricePerUnit: Number(price),
              availableQuantity: Number(quantity),
              locationDetail: location,
            });
          } else {
            // Direct API call as fallback
            const { createProduct } = await import("@/services/api/product");
            await createProduct({
              name,
              description,
              category,
              unitCode: unit,
              pricePerUnit: Number(price),
              availableQuantity: Number(quantity),
              locationDetail: location,
            });
          }
          setSubmitSuccess(true);
          setTimeout(() => router.push("/dashboard"), 1500);
        } catch (err: unknown) {
          setSubmitError(err instanceof Error ? err.message : "Đăng sản phẩm thất bại.");
        } finally {
          setSubmittingProduct(false);
        }
      }}>
        {/* Basic Info */}
        <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-lg">Thông tin cơ bản</h3>
          <div>
            <label htmlFor="new-product-name" className="block text-sm font-medium mb-2">
              Tên sản phẩm * {confidenceBadge("name")}
            </label>
            <input
              id="new-product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Xoài Cát Hòa Lộc Tiền Giang"
              className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${fieldClass("name")}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Mô tả sản phẩm * {confidenceBadge("description")}
            </label>
            <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-surface rounded-xl animate-pulse" />}>
              <AIRefiner
                value={description}
                onAccept={(text) => setDescription(text)}
                placeholder="Mô tả chi tiết về sản phẩm, nguồn gốc, đặc điểm nổi bật..."
              />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="new-product-price" className="block text-sm font-medium mb-2">
                Giá * {confidenceBadge("price")}
              </label>
              <div className="relative">
                <input
                  id="new-product-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="95000"
                  className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${fieldClass("price")}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">
                  đ
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="new-product-unit" className="block text-sm font-medium mb-2">
                Đơn vị tính * {confidenceBadge("unit")}
              </label>
              <select
                id="new-product-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${fieldClass("unit")}`}
              >
                <option value="KG">Kg</option>
                <option value="PIECE">Trái/Quả</option>
                <option value="BOX">Thùng/Hộp</option>
                <option value="BUNCH">Bó/Chùm</option>
                <option value="BAG">Bao/Túi</option>
                <option value="YEN">Yến</option>
                <option value="TA">Tạ</option>
                <option value="TON">Tấn</option>
              </select>
            </div>
            <div>
              <label htmlFor="new-product-qty" className="block text-sm font-medium mb-2">
                Sản lượng * {confidenceBadge("quantity")}
              </label>
              <input
                id="new-product-qty"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="500"
                className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${fieldClass("quantity")}`}
              />
            </div>
          </div>

          {/* AI Price Advisor — lazy loaded */}
          <Suspense fallback={<div className="h-20 bg-blue-50/50 dark:bg-info/5 rounded-xl animate-pulse" />}>
            <PriceAdvisor productName={name} currentPrice={price} onPriceChange={setPrice} />
          </Suspense>

          <div>
            <label htmlFor="new-product-category" className="block text-sm font-medium mb-2">Danh mục</label>
            <select
              id="new-product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="FRUIT">Trái cây</option>
              <option value="VEGETABLE">Rau củ</option>
              <option value="GRAIN">Ngũ cốc &amp; Hạt</option>
              <option value="TUBER">Củ</option>
              <option value="HERB">Gia vị &amp; Thảo mộc</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Hình ảnh sản phẩm</h3>
          <div 
            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer relative"
            onClick={() => document.getElementById('product-image-upload')?.click()}
          >
            <input 
              id="product-image-upload" 
              type="file" 
              multiple 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files) {
                  const newImages = Array.from(e.target.files).map(f => URL.createObjectURL(f));
                  setImages([...images, ...newImages].slice(0, 6)); // max 6 images
                }
              }}
            />
            <Upload className="w-10 h-10 text-foreground-muted mx-auto mb-3" />
            <p className="font-medium text-sm">
              Kéo thả hoặc nhấn để tải ảnh lên
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              PNG, JPG, WEBP • Tối đa 5MB • Tối đa 6 ảnh
            </p>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg object-cover overflow-hidden border border-border">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImages(images.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traceability */}
        <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-lg">
            Thông tin truy xuất
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-product-location" className="block text-sm font-medium mb-2">
                Địa điểm canh tác {confidenceBadge("location")}
              </label>
              <input
                id="new-product-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ví dụ: Cai Lậy, Tiền Giang"
                className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${fieldClass("location")}`}
              />
            </div>
            <div>
              <label htmlFor="new-product-harvest" className="block text-sm font-medium mb-2">
                Ngày thu hoạch (dự kiến) {confidenceBadge("harvestDate")}
              </label>
              <input
                id="new-product-harvest"
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${fieldClass("harvestDate")}`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-product-farming" className="block text-sm font-medium mb-2">
              Phương thức canh tác {confidenceBadge("farmingMethod")}
            </label>
            <select
              id="new-product-farming"
              value={farmingMethod}
              onChange={(e) => setFarmingMethod(e.target.value)}
              className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none ${fieldClass("farmingMethod")}`}
            >
              <option value="ORGANIC">Hữu cơ</option>
              <option value="VIETGAP">VietGAP</option>
              <option value="GLOBALGAP">GlobalGAP</option>
              <option value="TRADITIONAL">Canh tác truyền thống</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        {submitError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Đăng sản phẩm thành công! Đang chuyển hướng...
          </div>
        )}
        <div className="flex gap-4 pb-8">
          <button
            type="button"
            onClick={() => {
              const draft = { name, description, price, unit, quantity, category, location, harvestDate, farmingMethod };
              localStorage.setItem("capnong-product-draft", JSON.stringify(draft));
              showToast("success", "Đã lưu nháp thành công!");
            }}
            className="flex-1 border border-border text-foreground-muted font-bold py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-background-light transition-colors"
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            disabled={submittingProduct || submitSuccess}
            className="flex-[2] bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {submittingProduct ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Đang đăng...</span>
            ) : (
              "Đăng sản phẩm"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
