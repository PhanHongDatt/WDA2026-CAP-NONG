import type { Metadata } from "next";
import Link from "next/link";
import { Home, Leaf, Banknote, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import FarmCard from "@/components/ui/FarmCard";
import CoopPoolCard from "@/components/ui/CoopPoolCard";
import HeroBanner from "@/components/ui/HeroBanner";
import CategoryGrid from "@/components/ui/CategoryGrid";
import FlashDeal from "@/components/ui/FlashDeal";
import {
  MOCK_SEASONAL_PRODUCTS,
  MOCK_NEW_PRODUCTS,
  MOCK_SHOPS,
  MOCK_COOP_POOL,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Trang Chủ",
  description:
    "Mua nông sản sạch trực tiếp từ nhà vườn. Trái cây miền Tây, rau củ Đà Lạt, thủy sản tươi sống — giao tận nhà, truy xuất nguồn gốc minh bạch.",
  openGraph: {
    title: "Cạp Nông — Nông sản sạch từ nông trại đến bàn ăn",
    description:
      "Kết nối nhà vườn ĐBSCL với người tiêu dùng. Gom đơn tiết kiệm, truy xuất nguồn gốc.",
  },
};

// ISR — Revalidate every 60s for fresh product data (Paper #1: Next.js ISR)
export const revalidate = 60;

// JSON-LD Structured Data — WebSite + Organization
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Cạp Nông",
      url: "https://capnong.vn",
      description: "Hệ sinh thái thương mại nông sản thông minh",
      inLanguage: "vi",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://capnong.vn/catalog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Cạp Nông",
      url: "https://capnong.vn",
      logo: "https://capnong.vn/images/logo.png",
      sameAs: [],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+84-901-234-567",
        contactType: "customer service",
        availableLanguage: "Vietnamese",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Promo Banner — trust badges */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-around items-center">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Home className="w-5 h-5" />
            <span>Từ nông trại đến bàn ăn</span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Leaf className="w-5 h-5" />
            <span>Nông sản hữu cơ</span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Banknote className="w-5 h-5" />
            <span>Siêu tiết kiệm</span>
          </div>
        </div>
      </section>

      {/* HERO BANNER — Shopee-style carousel + side banners */}
      <div className="py-4 bg-gradient-to-b from-primary/5 to-transparent">
        <HeroBanner />
      </div>

      {/* CATEGORY GRID — Shopee-style "DANH MỤC" */}
      <CategoryGrid />

      {/* FLASH DEAL — Shopee-style countdown + scroll */}
      <FlashDeal />

      <main className="max-w-7xl mx-auto px-4 py-2">
        {/* SECTION: Seasonal Products */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nông sản đang mùa tại Cạp Nông
              </h2>
              <div className="flex gap-3">
                {["Tất cả", "Trái cây", "Rau củ", "Thủy hải sản"].map(
                  (cat, i) => (
                    <button type="button"
                      key={cat}
                      className={
                        i === 0
                          ? "px-5 py-1.5 rounded-full bg-primary text-white text-sm font-medium"
                          : "px-5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200"
                      }
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>
            <Link
              href="/catalog"
              className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {MOCK_SEASONAL_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="seasonal"
              />
            ))}
          </div>
        </section>

        {/* SECTION: Cooperative Pool */}
        <CoopPoolCard pool={MOCK_COOP_POOL} />

        {/* SECTION: Featured Farms */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Nhà vườn nổi bật
            </h2>
            <Link
              href="/shops"
              className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {MOCK_SHOPS.map((shop) => (
              <FarmCard key={shop.id} shop={shop} />
            ))}
          </div>
        </section>

        {/* SECTION: "Gợi ý cho bạn" — Shopee-style product grid */}
        <section className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-primary uppercase tracking-widest">
              Gợi ý cho bạn
            </h2>
            <div className="w-20 h-0.5 bg-primary mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-6 gap-4">
            {[...MOCK_SEASONAL_PRODUCTS, ...MOCK_NEW_PRODUCTS].map((product) => (
              <ProductCard
                key={`suggest-${product.id}`}
                product={product}
                variant="latest"
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
