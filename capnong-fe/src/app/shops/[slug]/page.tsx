"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { shopService } from "@/services";
import type { Product } from "@/types/product";

const GALLERY = [
  {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCN7e-DAKn_Wc3DgPnVTLhr2rp1N4Czdn6nkSVqpNqxD97ekhP1rrwsHuPMi0iSRpworC6nzlicoDoMEoijOM4AmrIjObq3hOUQw2kn2VoNoMqENLnld-cPHZc-AZDwLsw98dtOExdxCd79n5QpiDKUERC3qkmUiXyRMMVv8gyVwty_KDUyWyEQ-wCnxZj62ldPvFNCAFyFMVT31Lr7X7xoXThe5UDERFffm1e-BrzyEQYOf0QwE20H_2Gtdr8OhuZj03xazBZh7oc",
    caption: "Vườn Dừa Xiêm",
  },
  {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC230mF7t8Rt-IaRjGxOHHFA83cvUrXiiK0wiMiakO1z43-PiDVnoGv4-RmBPJ7Rp4Ven8NEhtTqJgGEH_235ppcK38OceYOP_0_tmBEEWJQ6HtitMq_U9WOx9b-3pyQZ91qhsNn32INaXYUpEvKMVOvDpZIyauFl76l-_vEER6Zlp9bu7rl7aPxT-N2FlrF6t-Pn41Q38p9VBjVvxKXHci0cVJYclaf0-SDHKn1ELMkDP3lrv1uaDhms9B8QmuPQf9Q_HFjEXiF6A",
    caption: "Bưởi Da Xanh",
  },
  {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSEOjPIdnIEKbtwMfsz5KAdiWhzs99KyexcgbRqh4c4QpyLTB9dSgKHwFTJv4e7iUkub5gB8I082Rwp8gp5HtwFp8vahewaSmlvKfv2qwAXBWE8A9zpqjVLcmGp8F7LB3Rb26I9kB5wafGKyflhFfSdJcjZzmWtwWWxzX69IyTK1jxIkcD8t5sSUYrMZW3EPuEvdwxCFiv1wjfnqFrWA4KMzCUT2f95mLl8xQMwt3jlXbYbVSvTa49WZA9xJlqmvAG90vQEVimhz0",
    caption: "Khu Ủ Phân Hữu Cơ",
  },
  {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXCQXiro0CiC2OQtDqiqY23VRtsOomSCEnVgha2vpnjdanWkx53sRiAlLmFMUUY0iAYYj5560-EUChBvW-QutfW5gDVvIYbrIPxMEB58fHAwShV8mlOD9iQWvX6MlENlxX-wxTy5R81fX_vkLO4mX97mF447ge8rvZCzy22SCRA06QcXHDjyGCh415AOLubkQ6CJxK_GjSjf0juRUKaCL4oSwHi-YL-fM0nqa_cX5LR-Zbc28Jng6kQxKzNcaVmckYUHmE8aislvE",
    caption: "Thu Hoạch Sáng Sớm",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ShopProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [shop, setShop] = useState<any>(null);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "reviews">("products");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await shopService.getBySlug(slug);
        setShop(s);
        const products = await shopService.getProducts(slug);
        setShopProducts(products);
      } catch {
        setShop(null);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy gian hàng</h2>
        <p className="text-foreground-muted mb-6">Gian hàng này không tồn tại hoặc đã ngừng hoạt động.</p>
        <Link href="/catalog" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold">
          Xem danh mục
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/catalog"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground-muted" />
            </Link>
            <h2 className="text-lg font-bold leading-tight tracking-tight">
              Gian hàng
            </h2>
          </div>
          <button type="button" aria-label="Chia sẻ gian hàng" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-foreground-muted" />
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-[1200px] mx-auto w-full">
        {/* Hero Banner */}
        <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0LPGHsiCpf9qZPOhl-n9e25f2NWxnJDevayX_g-_sj-XGYloYRoiN7ozEWYvcR97a1kZcvuihtnpABJPlhI7IQA8cYRc_ZRtQ0Km-bDUBGuTwFt28zXsNB08idrmMFIsgTpGTClUPY_W3f3fDkng5YvSD56Jzk_InheElzEoWlvqsbJObWVRdB0VX9ylRbfKaJTevT1NuUbMi0dDM7yuuwyxf7HjOwdwpU8ZbiG96AV0C3K-BYaIxVeFMbvSfgtVxjKq8PiO_4dA"
            alt="Farm cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-6 left-6 md:left-10 z-20 flex flex-col md:flex-row items-end md:items-center gap-4">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden shadow-xl bg-white">
              <Image
                src={shop.avatar_url || ""}
                alt={shop.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-white pb-2">
              <h1 className="text-2xl md:text-4xl font-bold">{shop.name}</h1>
              <p className="flex items-center gap-1 text-gray-200 text-sm md:text-base">
                <MapPin className="w-4 h-4" /> {shop.province}
              </p>
              <p className="text-xs md:text-sm text-gray-300 mt-1 font-medium bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                {shop.average_rating} đánh giá — {shop.years_experience} năm kinh
                nghiệm — {shop.farm_area_m2 ? `${(shop.farm_area_m2 / 10000).toFixed(1)} hecta` : ""} diện tích
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="px-4 py-8 md:px-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Story Card */}
            <section className="bg-primary-50 p-6 rounded-xl border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-primary">
                  Câu chuyện người trồng
                </h3>
              </div>
              <p className="italic text-foreground-muted leading-relaxed text-lg">
                &ldquo;Hơn {shop.years_experience} năm gắn bó với mảnh đất{" "}
                {shop.province}, chúng tôi luôn tâm niệm mang đến những sản
                phẩm sạch, thuận tự nhiên nhất cho mọi gia đình.&rdquo;
              </p>
            </section>

            {/* Gallery */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Hình ảnh vườn</h3>
                <button type="button" className="text-primary font-bold text-sm hover:underline">
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GALLERY.map((img, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2">
                      <Image
                        src={img.url}
                        alt={img.caption}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <p className="text-xs font-medium text-foreground-muted text-center uppercase tracking-wider">
                      {img.caption}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Tabs & Products */}
            <section className="mt-10">
              <div className="border-b border-border flex gap-8 mb-6 overflow-x-auto">
                <button type="button"
                  onClick={() => setActiveTab("products")}
                  className={`pb-3 border-b-2 font-medium text-base whitespace-nowrap transition-colors ${
                    activeTab === "products"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Sản phẩm
                </button>
                <button type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 border-b-2 font-medium text-base whitespace-nowrap transition-colors ${
                    activeTab === "reviews"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-foreground-muted hover:text-foreground"
                  }`}
                >
                  Đánh giá ({shop.total_reviews})
                </button>
              </div>

              {activeTab === "products" ? (
                shopProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {shopProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        variant="latest"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-foreground-muted">
                    <p className="font-medium">Chưa có sản phẩm nào</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-foreground-muted">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Chưa có đánh giá nào</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
              <h4 className="font-bold text-lg mb-4">Thông tin liên hệ</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-foreground-muted shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground-muted">
                    {shop.district}, {shop.province}
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-foreground-muted shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground-muted">
                    Mở cửa: 07:00 - 18:00 (Hàng ngày)
                  </p>
                </li>
              </ul>

              {/* Map Placeholder */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs font-medium text-foreground-muted mb-4 uppercase tracking-wider">
                  Vị trí vườn
                </p>
                <div className="h-40 rounded-lg bg-gray-100 overflow-hidden relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsElW2a5VucNeDtubIsbq34KItCxHPzMgdiB2AxjzC8esp5aH-EGfAYUG-vpGApm7NyWajw5aqIb8QJ5P387YvMXQGCiREzJzfrf3xzaBsnwentJP7TXttrTxxLu15x0pGfJlnnZ-MOb81iiTyArb1yHggg7TRqdH5ot-sw-aQfH2vKGYYcEEAo26TQ1x1myY8694aQkMmeM0HTYSNOxLDMBBkKDrB0gOuoUiFlQGlfPEed1fdSleIqBnG-23Af28wvzSuAk4Pmzo"
                    alt="Map"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-primary drop-shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contact Button */}
      <button type="button" className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary-light text-white flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl transition-transform active:scale-95">
        <MessageCircle className="w-5 h-5" />
        <span className="font-bold">Liên hệ</span>
      </button>
    </>
  );
}
