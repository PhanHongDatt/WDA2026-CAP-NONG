"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Shield,
  MapPin,
  Minus,
  Plus,
  Share2,
  CheckCircle2,
  Loader2,
  Package,
} from "lucide-react";
import { productService, cartService } from "@/services";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";
import ProductCard from "@/components/ui/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductReviews, type ReviewResponse } from "@/services/api/review";

const FARMING_METHOD_LABEL: Record<string, string> = {
  ORGANIC: "🌿 Hữu cơ",
  VIETGAP: "✅ VietGAP",
  GLOBALGAP: "🌍 GlobalGAP",
  TRADITIONAL: "🌾 Truyền thống",
};

const CATEGORY_LABEL: Record<string, string> = {
  FRUIT: "Trái cây",
  VEGETABLE: "Rau củ",
  MEAT: "Thịt gia súc/gia cầm",
  SEAFOOD: "Thủy hải sản",
  SPICE: "Gia vị",
  GRAIN: "Lúa gạo & Ngũ cốc",
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const wishlisted = isWishlisted(id);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const p = await productService.getById(id);
      setProduct(p);
      // Load related products
      try {
        const seasonal = await productService.getSeasonalProducts();
        setRelatedProducts(seasonal.filter((s) => s.id !== id).slice(0, 4));
      } catch { /* ignore */ }
      try {
        const revs = await getProductReviews(id, 0, 5);
        setReviews(revs.content || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setReviewCount(revs.totalElements || (revs as any).total_elements || 0);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-xl font-bold text-foreground mb-4">Không tìm thấy sản phẩm</p>
        <Link href="/catalog" className="text-primary hover:underline">← Quay lại danh mục</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ["/images/placeholder.jpg"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/home" className="hover:text-primary">🏠 Trang chủ</Link>
        <span>›</span>
        <Link href="/catalog" className="hover:text-primary">Danh mục</Link>
        <span>›</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Image Gallery */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-square bg-gray-50 dark:bg-surface rounded-2xl overflow-hidden">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.pesticide_free && (
              <span className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                Không BVTV
              </span>
            )}
            {product.farming_method !== "TRADITIONAL" && (
              <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                {FARMING_METHOD_LABEL[product.farming_method]}
              </span>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Xem ảnh ${i + 1}`}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    i === selectedImage ? "border-primary" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Info */}
        <div className="space-y-5">
          {/* Name + Rating */}
          <div>
            <h1 className="text-2xl font-black text-foreground leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{product.average_rating?.toFixed(1) || "—"}</span>
                <span className="text-foreground-muted">({product.total_reviews} đánh giá)</span>
              </div>
              <span className="text-foreground-muted">|</span>
              <span className="text-foreground-muted">Đã bán {product.sold_count}</span>
            </div>

            {product.bundle_id && (
              <Link href={`/cooperative/bundles/${product.bundle_id}`} className="mt-3 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-3 hover:bg-amber-100 transition-colors block">
                <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Sản phẩm Gom đơn HTX (Mua sỉ)</p>
                  <p className="text-xs text-amber-700 mt-0.5">Sản phẩm này được cộng gộp từ các nông dân trong HTX. Bấm để xem chi tiết tiến độ gom đơn.</p>
                </div>
              </Link>
            )}
          </div>

          {/* Price */}
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4">
            <p className="text-3xl font-black text-primary">
              {formatCurrency(product.price_per_unit)}
              <span className="text-base font-normal text-foreground-muted ml-1">
                / {product.unit?.display_name || "kg"}
              </span>
            </p>
          </div>

          {/* Shop */}
          <Link href={`/shop/${product.shop?.slug || product.shop?.id}`} className="flex items-center gap-3 p-3 bg-white dark:bg-surface rounded-xl border border-border hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {product.shop?.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{product.shop?.name}</p>
              <p className="text-xs text-foreground-muted flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[product.shop?.ward, product.shop?.province].filter(Boolean).join(", ") || "Chưa cập nhật địa chỉ"}
              </p>
            </div>
            <ArrowLeft className="w-4 h-4 text-foreground-muted rotate-180" />
          </Link>

          {/* Quantity + Add to cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground-muted">Số lượng</span>
              <div className="flex items-center border border-border rounded-lg">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Giảm số lượng" title="Giảm số lượng" className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-bold text-sm min-w-[40px] text-center">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Tăng số lượng" title="Tăng số lượng" className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-foreground-muted">
                Còn {product.available_quantity} {product.unit?.symbol || "kg"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={addingToCart || addedToCart}
                onClick={async () => {
                  if (!product) return;
                  setAddingToCart(true);
                  try {
                    await cartService.addItem(product.id, quantity);
                    setAddedToCart(true);
                    setTimeout(() => setAddedToCart(false), 2500);
                  } catch {
                    /* API fail — silent, cart page sẽ hiện lỗi */
                  } finally {
                    setAddingToCart(false);
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors shadow-md shadow-primary/20 ${
                  addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-primary text-white hover:bg-primary-light"
                } disabled:opacity-70`}
              >
                {addingToCart ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Đang thêm...</>
                ) : addedToCart ? (
                  <><CheckCircle2 className="w-5 h-5" /> Đã thêm ✓</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ hàng</>
                )}
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(id)}
                aria-label="Thêm vào yêu thích"
                title="Thêm vào yêu thích"
                className={`p-3 rounded-xl border transition-colors ${wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-border text-foreground-muted hover:border-primary"}`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500" : ""}`} />
              </button>
              <button type="button" aria-label="Chia sẻ sản phẩm" title="Chia sẻ sản phẩm" className="p-3 rounded-xl border border-border text-foreground-muted hover:border-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trust row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Truck, label: "Giao tận nơi" },
              { icon: Shield, label: "Đảm bảo chất lượng" },
              { icon: Star, label: "Truy xuất nguồn gốc" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 py-2 px-1 bg-gray-50 dark:bg-surface rounded-lg">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-foreground-muted font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <section className="bg-white dark:bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Mô tả sản phẩm</h2>
          <div className="text-sm text-gray-700 dark:text-foreground-muted leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Xuất xứ", value: product.location_detail },
              { label: "Phương pháp", value: FARMING_METHOD_LABEL[product.farming_method] || "Truyền thống" },
              { label: "Thu hoạch", value: product.harvest_date || "—" },
              { label: "Danh mục", value: CATEGORY_LABEL[product.category || ""] || product.category || "—" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 dark:bg-background-light rounded-lg p-3">
                <p className="text-[10px] text-foreground-muted uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="bg-white dark:bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Đánh giá từ khách hàng</h2>
          <div className="text-sm text-primary font-bold">
            {reviews.length > 0 ? `${reviewCount} đánh giá` : "Chưa có đánh giá"}
          </div>
        </div>
        
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                  {review.author_avatar_url ? (
                    <Image
                      src={review.author_avatar_url}
                      alt={review.author_name || "User"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {review.author_name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{review.author_name || "Người dùng ẩn danh"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-foreground-muted">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">
                      {review.comment}
                    </p>
                  )}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-border shrink-0">
                          <Image src={img} alt="Review photo" width={64} height={64} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {review.seller_reply && (
                    <div className="mt-4 bg-gray-50 dark:bg-background-light p-3 rounded-lg border border-border">
                      <p className="text-xs font-bold text-primary mb-1">Phản hồi từ Nhà phân phối</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{review.seller_reply}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-foreground-muted text-sm mb-2">Chưa có đánh giá nào cho sản phẩm này.</p>
            <p className="text-xs text-gray-400">Hãy là người đầu tiên trải nghiệm và để lại đánh giá nhé!</p>
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
