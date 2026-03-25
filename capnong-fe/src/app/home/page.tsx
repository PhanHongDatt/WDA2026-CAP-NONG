import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import FarmCard from "@/components/ui/FarmCard";
import CoopPoolSection from "@/components/ui/CoopPoolSection";
import HeroBanner from "@/components/ui/HeroBanner";
import CategoryGrid from "@/components/ui/CategoryGrid";
import FlashDeal from "@/components/ui/FlashDeal";
import { productService, shopService } from "@/services";
import { MOCK_COOP_POOL } from "@/lib/mock-data";

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

export default async function HomePage() {
  const [seasonalProducts, newProducts, shops] = await Promise.all([
    productService.getSeasonalProducts(),
    productService.getNewProducts(),
    shopService.getBySlug("nong-trai-xanh-da-lat").then(async () => {
      // Lấy danh sách shops từ mock hoặc API
      const { MOCK_SHOPS } = await import("@/lib/mock-data");
      return MOCK_SHOPS; // TODO: shopService.list() khi BE có endpoint
    }),
  ]);
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Trust Badges — redesigned */}
      <section className="bg-gradient-to-r from-primary/5 via-white to-primary/5 dark:from-primary/10 dark:via-background dark:to-primary/10 border-b border-gray-100 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-3 gap-4">
          {[
            { icon: "🌾", title: "Từ nông trại đến bàn ăn", desc: "Trực tiếp, không qua trung gian" },
            { icon: "🌿", title: "100% hữu cơ", desc: "Đạt chuẩn VietGAP / GlobalGAP" },
            { icon: "💰", title: "Gom đơn tiết kiệm", desc: "Giảm 20-40% nhờ mua chung" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border shadow-sm">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-bold text-sm text-foreground">{item.title}</p>
                <p className="text-[11px] text-foreground-muted">{item.desc}</p>
              </div>
            </div>
          ))}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {seasonalProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* SECTION: Cooperative Pool — chỉ hiện cho HTX members/managers */}
        <CoopPoolSection pool={MOCK_COOP_POOL} />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {shops.map((shop) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...seasonalProducts, ...newProducts].map((product) => (
              <ProductCard key={`suggest-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
