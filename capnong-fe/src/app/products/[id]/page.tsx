"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
  QrCode,
  ChevronDown,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { formatCurrency } from "@/lib/utils";
import { productService, cartService } from "@/services";
import type { Product } from "@/types/product";
import { useToast } from "@/components/ui/Toast";

const REVIEWS = [
  {
    id: 1,
    name: "Nguyễn Thu Hà",
    avatar: "",
    rating: 5,
    comment:
      "Xoài rất tươi, ngọt lịm đúng vị Hòa Lộc. Đóng gói rất kỹ, giao hàng nhanh. Sẽ ủng hộ vườn tiếp!",
    image: "",
    date: "2 ngày trước",
  },
  {
    id: 2,
    name: "Trần Minh Tuấn",
    avatar: "",
    rating: 5,
    comment: "Xoài chất lượng tuyệt vời, cơm vàng ươm, ngọt lịm. Đúng hàng xịn!",
    image: "",
    date: "5 ngày trước",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { showToast } = useToast();

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    try {
      await cartService.addItem(product.id, quantity);
      setAddedToCart(true);
      showToast("success", "Đã thêm vào giỏ hàng");
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Add to cart failed:", err);
      showToast("error", "Không thể thêm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = await productService.getById(id);
        setProduct(p);
        // Also fetch related
        const seasonal = await productService.getSeasonalProducts();
        setRelatedProducts(seasonal.filter(s => s.id !== id).slice(0, 4));
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-foreground-muted mb-6">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <Link href="/catalog" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold">
          Xem danh mục
        </Link>
      </div>
    );
  }

  const THUMBNAILS = [
    product.images[0],
    ...(product.images.slice(1) || []),
  ].filter(Boolean);

  return (
    <>
      {/* Detail Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/catalog" className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Quay lại danh mục">
              <ArrowLeft className="w-5 h-5 text-foreground-muted" />
            </Link>
            <h1 className="text-lg font-bold leading-tight tracking-tight">
              Chi tiết sản phẩm
            </h1>
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label="Chia sẻ" className="flex items-center justify-center rounded-full w-10 h-10 bg-gray-100 text-foreground-muted hover:bg-primary/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button type="button" aria-label="Thêm vào yêu thích" className="flex items-center justify-center rounded-full w-10 h-10 bg-gray-100 text-foreground-muted hover:bg-red-50 group transition-colors">
              <Heart className="w-5 h-5 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-8">
        {/* Product Main Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <Image
                src={THUMBNAILS[selectedImage] || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute top-4 left-4">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  🌿 Đang mùa
                </span>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {THUMBNAILS.map((thumb, i) => (
                <button type="button"
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`Xem ảnh ${i + 1}`}
                  className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden cursor-pointer bg-white shadow-sm border-2 transition-colors ${
                    selectedImage === i ? "border-primary" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={thumb}
                    alt={`Thumbnail ${i + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-foreground mb-1">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-foreground-muted text-sm">
                Đã bán {product.sold_count}+
              </span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-primary" />
                <span className="text-sm font-bold">
                  {product.average_rating} ({product.total_reviews} nhận xét)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-3xl font-black text-primary">
                {formatCurrency(product.price_per_unit)}{" "}
                <span className="text-lg font-medium text-foreground-muted">
                  / {product.unit.symbol}
                </span>
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["Hữu cơ", "Không BVTV", "VietGAP"].map((badge) => (
                <span
                  key={badge}
                  className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Shop Row */}
            <div className="bg-white border border-border rounded-xl p-4 mb-8 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100 flex items-center justify-center text-lg">
                  {product.shop.avatar_url ? (
                    <Image
                      src={product.shop.avatar_url}
                      alt={product.shop.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>🌱</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-foreground">{product.shop.name || "Nhà vườn"}</p>
                  <div className="flex items-center gap-2 text-xs text-foreground-muted">
                    <span className="flex items-center gap-0.5 text-yellow-500">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {product.shop.average_rating}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {product.shop.province || product.location_detail || "Việt Nam"}
                    </span>
                  </div>
                </div>
              </div>
              {product.shop.slug ? (
                <Link
                  href={`/shop/${product.shop.slug}`}
                  className="text-primary text-sm font-bold border border-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Xem gian hàng
                </Link>
              ) : (
                <span className="text-foreground-muted text-sm px-4 py-2">
                  Gian hàng
                </span>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <p className="text-sm font-bold text-foreground-muted">
                  Số lượng
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden bg-white">
                    <button type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Giảm số lượng"
                      className="p-2 hover:bg-gray-50 text-foreground-muted"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-4 font-bold min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Tăng số lượng"
                      className="p-2 hover:bg-gray-50 text-foreground-muted"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-sm text-foreground-muted">
                    Còn {product.available_quantity} {product.unit.symbol}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`flex-1 border-2 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    addedToCart
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-primary text-primary hover:bg-primary/5'
                  } ${addingToCart ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Đang thêm...' : addedToCart ? 'Đã thêm ✓' : 'Thêm vào giỏ'}
                </button>
                <button type="button" className="flex-[1.5] bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2/3: Description + Reviews */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Description */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Mô tả sản phẩm</h3>
                <ChevronDown className="w-5 h-5 text-foreground-muted" />
              </div>
              <div className="text-foreground-muted leading-relaxed space-y-3">
                <p>{product.description || "Chưa có mô tả chi tiết."}</p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Đánh giá sản phẩm</h3>
              <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-border pb-8">
                <div className="flex flex-col items-center justify-center bg-primary/5 rounded-2xl p-6 min-w-[160px]">
                  <p className="text-4xl font-black text-primary">{product.average_rating}</p>
                  <div className="flex text-primary mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground-muted">{product.total_reviews} đánh giá</p>
                </div>
                <div className="flex flex-wrap gap-2 content-center">
                  {["Tất cả", `5 sao`, `4 sao`, "Có hình ảnh"].map(
                    (label, i) => (
                      <button type="button"
                        key={label}
                        className={
                          i === 0
                            ? "bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
                            : "bg-gray-100 text-foreground-muted px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                        }
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Review List */}
              <div className="flex flex-col gap-6">
                {REVIEWS.map((review) => (
                  <div key={review.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                      {review.avatar && (
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{review.name}</p>
                      <div className="flex text-yellow-500 gap-0.5 my-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm mt-1 text-foreground-muted">
                        {review.comment}
                      </p>
                      {review.image && (
                        <div className="mt-3">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-border">
                            <Image
                              src={review.image}
                              alt="Review photo"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-foreground-muted mt-2">
                        {review.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1/3: Traceability */}
          <div className="flex flex-col gap-6">
            <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-primary">
                  Truy xuất nguồn gốc
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Hợp tác xã", value: product.shop.name },
                  { label: "Vùng trồng", value: product.location_detail },
                  { label: "Ngày thu hoạch", value: product.harvest_date || "Chưa xác định" },
                  {
                    label: "Phương pháp",
                    value: product.farming_method,
                    verified: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 p-3 bg-white rounded-xl shadow-sm border border-primary/10"
                  >
                    <p className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">
                      {item.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{item.value}</p>
                      {item.verified && (
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" className="mt-2 w-full flex items-center justify-center gap-2 text-primary font-bold text-sm bg-white border border-primary/20 py-3 rounded-xl hover:bg-primary/5 transition-colors">
                  <QrCode className="w-5 h-5" />
                  Xem chứng chỉ đầy đủ
                </button>
              </div>
            </div>

            {/* Traceability Timeline — hash-chain */}
            <div className="bg-white dark:bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-base font-bold mb-4">Hành trình nông sản</h3>
              <div className="relative pl-6 space-y-5">
                {/* Timeline line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
                {[
                  { step: "Gieo trồng", date: "05/01/2026", desc: "Gieo hạt giống đạt chuẩn, đất đã kiểm tra pH", hash: "a3f8c1", color: "bg-amber-500" },
                  { step: "Chăm sóc", date: "05/01 – 15/03/2026", desc: "Bón phân hữu cơ, tưới nhỏ giọt, không thuốc BVTV", hash: "7d2e4b", color: "bg-green-500" },
                  { step: "Thu hoạch", date: product.harvest_date || "20/03/2026", desc: "Hái chín tự nhiên trên cây, chọn lọc kỹ", hash: "e9c3f0", color: "bg-primary" },
                  { step: "Đóng gói & Giao", date: "21/03/2026", desc: "Đóng hộp giữ tươi, giao trong 24h", hash: "1b5a82", color: "bg-blue-500" },
                ].map((item, i) => (
                  <div key={i} className="relative flex gap-3">
                    <div className={`absolute -left-6 top-1 w-[18px] h-[18px] rounded-full ${item.color} border-2 border-white dark:border-surface shadow-sm z-10`} />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm font-bold text-foreground">{item.step}</p>
                        <span className="text-[10px] text-foreground-muted">{item.date}</span>
                      </div>
                      <p className="text-xs text-foreground-muted mt-0.5">{item.desc}</p>
                      <p className="text-[10px] text-foreground-muted/60 font-mono mt-1">
                        SHA-256: {item.hash}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-foreground-muted mt-4 text-center">
                Mỗi bước được ghi nhận bằng hash không thể thay đổi
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black">Sản phẩm tương tự</h3>
              <Link
                href="/catalog"
                className="text-primary font-bold text-sm hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} variant="latest" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 grid grid-cols-2 gap-3 z-50">
        <button type="button" className="border border-primary text-primary font-bold py-3 rounded-xl text-sm">
          Giỏ hàng
        </button>
        <button type="button" className="bg-primary text-white font-bold py-3 rounded-xl text-sm">
          Mua ngay
        </button>
      </div>
    </>
  );
}
