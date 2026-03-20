"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { MOCK_SEASONAL_PRODUCTS } from "@/lib/mock-data";

// Mock detail data based on product_detail.html
const PRODUCT = MOCK_SEASONAL_PRODUCTS[3]; // Xoài Cát Hòa Lộc

const THUMBNAILS = [
  PRODUCT.images[0],
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD_ifuZwEa_V1ZPpMZ4fY-f83tf96AmGtMWy9lA_KecQCG__S7lT5osNFFFfAFzW_2-5j6gYf70-EdPui-yoqo6_Aos4jryAIcJo3fDjrUAG96iRQ9cszvbNSkYpHebJQBd9v6V_R1jyyb_L-XorYE2jUaNkA4o3I7RgCi25AGuN35o9P4of2JKVIZsttAPN-ehN4OhU35Lub3ka84spx56TjJjZGX92fe5qzEGccuBti-bVIbY6-_egnilhw2zv_y5BIeMz391WKg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpIvQptkslQjTw-8wC20POyRjSUPDOBGbFSQXyMhs6WsjywRLQxIsuMj4B1MFSasG0RAXhz-UO6Mcdts_FHzCVG5ydvHV6CLf_ay8CVJrRO6SX_wWVfZEHdgHR0e1D1OVqH6UCUSGnZuyzj29lAKgViayfMTj8ES_wBk9EFzimik5c4E9fTNnJdxs_XF6rcKP-OnqXtPIK9ktnK8w-fBErkHNtKyEhHx_Cye4NpWZKZIvzgo3L1LP5xBD3Tu50nPgnhLNp6-lADpI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC0RLfhncudtDDRAriqOoyZOQjhSy8AKiA64H-HtQE0cJy738Z34aMxIgeohCiteGGA3TuVpvJ_XTl7R0ltnQEUCnWFud7zu6VSzkooJlPON1zb9fXCKPhZfuelKY5w7XgrAuK-GFQDLpaFCsS7fZhUxv6JZUjsYMGy5FY826ZE5NzENijRK440CR1mns2rEwb438heneZGmQBkj-TBXCCpn85g5OiQjdzX67UeRByJGmIXm-4AZroT9m1IglfeE1BPMwL6wTCDt6U",
];

const REVIEWS = [
  {
    id: 1,
    name: "Nguyễn Thu Hà",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB38X9KJkwa28pn5XXZG1FgK5mF0sYSglZd8Dbv0-w6sOTbUp51gwebgB8wx0mJ6pdWKzg2dEvajHyMCEtvvFO8Uebwvhtq04o1cLrZCREW8MtYP6-w0L0Vd6Ys8o0CjcviziwNQqWeE0llUm7BUvTt_SQ3i6Od88Jfsvzv8gw8vrKblIwX_lTMXYAajqTypENgM--5_OVU32XM6136G9SL1lPApmQf9ZhKlmV2XuT3FKMMCuFyOq4kStDjWEWf3AWt6FeviA71OZE",
    rating: 5,
    comment:
      "Xoài rất tươi, ngọt lịm đúng vị Hòa Lộc. Đóng gói rất kỹ, giao hàng nhanh. Sẽ ủng hộ vườn tiếp!",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZeKkIY8e5WkwU3khRSOVshbUr7plJMSo37BzpU6RLQVafP9gzl0ukR6Ohj6LiKDmexDFAZf7DB1lDfipv2H8Apk2tVa4UBfKtzMKGxj1unZcyqH67xlYRNbKyXewHa_Elyey75LVmDouKGxEz6_ujY0GzhckEMIWkrhra0S4XswpXD5Bg2CzDJkg4oI912ijDXWSWQhMbdkxDuhc_DVPEk6nr22WMx3rlTCWsXi-f4jGAHdxoXF8igUfcxCWr-QIvgv6rL3gDmos",
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
            <button aria-label="Chia sẻ" className="flex items-center justify-center rounded-full w-10 h-10 bg-gray-100 text-foreground-muted hover:bg-primary/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button aria-label="Thêm vào yêu thích" className="flex items-center justify-center rounded-full w-10 h-10 bg-gray-100 text-foreground-muted hover:bg-red-50 group transition-colors">
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
                src={THUMBNAILS[selectedImage]}
                alt={PRODUCT.name}
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
                <button
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
              {PRODUCT.name}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-foreground-muted text-sm">
                Đã bán {PRODUCT.sold_count}+
              </span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-primary" />
                <span className="text-sm font-bold">
                  {PRODUCT.average_rating} ({PRODUCT.total_reviews} nhận xét)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-3xl font-black text-primary">
                {formatCurrency(PRODUCT.price_per_unit)}{" "}
                <span className="text-lg font-medium text-foreground-muted">
                  / {PRODUCT.unit.symbol}
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
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100">
                  {PRODUCT.shop.avatar_url && (
                    <Image
                      src={PRODUCT.shop.avatar_url}
                      alt={PRODUCT.shop.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-bold text-foreground">{PRODUCT.shop.name}</p>
                  <div className="flex items-center gap-2 text-xs text-foreground-muted">
                    <span className="flex items-center gap-0.5 text-yellow-500">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {PRODUCT.shop.average_rating}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {PRODUCT.shop.province}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/shops/${PRODUCT.shop.slug}`}
                className="text-primary text-sm font-bold border border-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
              >
                Xem gian hàng
              </Link>
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <p className="text-sm font-bold text-foreground-muted">
                  Số lượng
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Giảm số lượng"
                      className="p-2 hover:bg-gray-50 text-foreground-muted"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-4 font-bold min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Tăng số lượng"
                      className="p-2 hover:bg-gray-50 text-foreground-muted"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-sm text-foreground-muted">
                    Còn {PRODUCT.available_quantity} {PRODUCT.unit.symbol}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 border-2 border-primary text-primary font-bold py-4 rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </button>
                <button className="flex-[1.5] bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
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
                <p>
                  Xoài cát Hòa Lộc là một trong những loại trái cây đặc sản nổi
                  tiếng nhất của vùng đồng bằng sông Cửu Long. Quả có hình dáng
                  thon dài, khi chín có màu vàng tươi đẹp mắt. Thịt xoài vàng
                  đậm, thơm nồng, vị ngọt thanh đặc trưng không lẫn vào đâu
                  được.
                </p>
                <p>
                  Sản phẩm được canh tác theo hướng hữu cơ tại vùng đất Bến
                  Tre, đảm bảo không sử dụng thuốc bảo vệ thực vật hóa học, an
                  toàn tuyệt đối cho sức khỏe người tiêu dùng.
                </p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white border border-border rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Đánh giá sản phẩm</h3>
              <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-border pb-8">
                <div className="flex flex-col items-center justify-center bg-primary/5 rounded-2xl p-6 min-w-[160px]">
                  <p className="text-4xl font-black text-primary">4.9</p>
                  <div className="flex text-primary mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground-muted">42 đánh giá</p>
                </div>
                <div className="flex flex-wrap gap-2 content-center">
                  {["Tất cả", "5 sao (40)", "4 sao (2)", "Có hình ảnh (15)"].map(
                    (label, i) => (
                      <button
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
                  { label: "Hợp tác xã", value: PRODUCT.shop.name },
                  { label: "Vùng trồng", value: PRODUCT.location_detail },
                  { label: "Ngày thu hoạch", value: PRODUCT.harvest_date || "Chưa xác định" },
                  {
                    label: "Phương pháp",
                    value: PRODUCT.farming_method,
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
                <button className="mt-2 w-full flex items-center justify-center gap-2 text-primary font-bold text-sm bg-white border border-primary/20 py-3 rounded-xl hover:bg-primary/5 transition-colors">
                  <QrCode className="w-5 h-5" />
                  Xem chứng chỉ đầy đủ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
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
            {MOCK_SEASONAL_PRODUCTS.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} variant="latest" />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 grid grid-cols-2 gap-3 z-50">
        <button className="border border-primary text-primary font-bold py-3 rounded-xl text-sm">
          Giỏ hàng
        </button>
        <button className="bg-primary text-white font-bold py-3 rounded-xl text-sm">
          Mua ngay
        </button>
      </div>
    </>
  );
}
