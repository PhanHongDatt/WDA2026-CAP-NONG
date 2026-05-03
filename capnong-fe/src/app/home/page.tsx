import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Leaf, Truck, ShieldCheck, Users } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import FarmCard from "@/components/ui/FarmCard";
import HeroBanner from "@/components/ui/HeroBanner";
import CategoryGrid from "@/components/ui/CategoryGrid";
import FlashDeal from "@/components/ui/FlashDeal";
import CoopPoolCard from "@/components/ui/CoopPoolCard";
import { productService, shopService } from "@/services";
import { getOpenBundles } from "@/services/api/htx";
import { MOCK_SEASONAL_PRODUCTS, MOCK_NEW_PRODUCTS, MOCK_SHOPS, MOCK_BUNDLE } from "@/lib/mock-data";
import type { Bundle } from "@/types/order";



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
      url: "https://capnong.shop",
      description: "Hệ sinh thái thương mại nông sản thông minh",
      inLanguage: "vi",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://capnong.shop/catalog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Cạp Nông",
      url: "https://capnong.shop",
      logo: "https://capnong.shop/images/logo.png",
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
  const [seasonalProducts, newProducts, shops, openBundles] = await Promise.all([
    productService.getSeasonalProducts().then((result) => {
      // If the backend API returns an empty list, forcibly inject mock data to ensure the UI is not empty
      if (result && result.length > 0) return result;
      return MOCK_SEASONAL_PRODUCTS;
    }).catch(() => MOCK_SEASONAL_PRODUCTS),
    
    productService.getNewProducts().then((result) => {
      if (result && result.length > 0) return result;
      return MOCK_NEW_PRODUCTS;
    }).catch(() => MOCK_NEW_PRODUCTS),
    
    shopService.getFeaturedShops().then((result) => {
      if (result && result.length > 0) return result;
      return MOCK_SHOPS;
    }).catch(() => MOCK_SHOPS),

    // Fetch open bundles — BE: GET /api/v1/cooperatives/bundles (snake_case response)
    getOpenBundles().then((result) => {
      if (Array.isArray(result) && result.length > 0) {
        // BE response already snake_case — khớp với Bundle type trong types/order.ts
        return result as unknown as Bundle[];
      }
      return [MOCK_BUNDLE];
    }).catch(() => [MOCK_BUNDLE]),
  ]);
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Feature Cards — gradient + icon overflow (tham khảo Hình 6-8) */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" suppressHydrationWarning>
            {[
              { gradient: "card-gradient-organic", icon: <Leaf className="w-7 h-7 text-green-600" />, title: "Hữu cơ", desc: "VietGAP / GlobalGAP" },
              { gradient: "card-gradient-delivery", icon: <Truck className="w-7 h-7 text-blue-600" />, title: "Giao tận nhà", desc: "Tươi ngon mỗi ngày" },
              { gradient: "card-gradient-trace", icon: <ShieldCheck className="w-7 h-7 text-indigo-600" />, title: "Truy xuất", desc: "Nguồn gốc minh bạch" },
              { gradient: "card-gradient-coop", icon: <Users className="w-7 h-7 text-orange-600" />, title: "Gom đơn", desc: "Tiết kiệm 20-40%" },
            ].map((item) => (
              <div
                key={item.title}
                suppressHydrationWarning
                className={`${item.gradient} relative overflow-visible rounded-2xl p-5 pt-10 text-center shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
              >
                {/* Icon — nhô lên trên viền card */}
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-lg bg-white/90 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center border border-white/20">
                  {item.icon}
                </span>
                <p className="font-extrabold text-white text-base leading-tight">{item.title}</p>
                <p className="text-white/80 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HERO BANNER — Shopee-style carousel + side banners */}
      <div className="py-4 bg-gradient-to-b from-primary/5 to-transparent">
        <HeroBanner />
      </div>

      {/* CATEGORY GRID — Shopee-style "DANH MỤC" (below fold → content-visibility) */}
      <div className="cv-auto">
        <CategoryGrid />
      </div>

      {/* FLASH DEAL — Shopee-style countdown + scroll */}
      <div className="cv-auto">
        <FlashDeal />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-2">
        {/* SECTION: Seasonal Products */}
        <section className="mb-12 -mx-4 px-4 py-8 bg-gradient-to-b from-green-50/50 to-transparent dark:from-primary/5 dark:to-transparent rounded-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Nông sản đang mùa tại Cạp Nông
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {["Tất cả", "Trái cây", "Rau củ", "Thủy hải sản"].map(
                  (cat, i) => (
                    <button type="button"
                      key={cat}
                      className={
                        i === 0
                          ? "px-4 sm:px-5 py-1.5 rounded-full bg-primary text-white text-xs sm:text-sm font-medium"
                          : "px-4 sm:px-5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-200"
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
              className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline shrink-0"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 product-grid-section" suppressHydrationWarning>
            {seasonalProducts.map((product) => (
              <ProductCard key={`seasonal-${product.id}`} product={product} variant="seasonal" />
            ))}
          </div>
        </section>

        <section className="mb-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Sản phẩm mới
              </h2>
            </div>
            <Link
              href="/catalog?sort=new"
              className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline shrink-0"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 product-grid-section" suppressHydrationWarning>
            {newProducts.map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} variant="latest" />
            ))}
          </div>
        </section>

        {/* SECTION: Cooperative Pool — Gom đơn nông sản */}
        {openBundles.length > 0 && openBundles.filter(b => b.status === "OPEN").slice(0, 1).map((bundle) => (
          <CoopPoolCard key={bundle.id} pool={bundle} />
        ))}

        {/* SECTION: Featured Farms — giống hình tham khảo carousel */}
        <section className="mb-12 relative">
          {/* Scalloped decorative border — sóng xanh giống hình */}
          <div
            className="h-4 w-full mb-4"
            style={{
              background: 'radial-gradient(circle 8px at 16px 0, transparent 8px, var(--color-primary, #2E7D32) 8.5px)',
              backgroundSize: '32px 16px',
              backgroundPosition: 'top center',
              backgroundRepeat: 'repeat-x',
              borderRadius: '0 0 4px 4px',
              opacity: 0.15,
            }}
          />
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-foreground">
              Khám phá <span className="text-primary">nhà cung cấp</span> dành riêng cho bạn!
            </h2>
          </div>
          {/* Horizontal scroll carousel */}
          <div className="relative group/carousel">
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-1">
              {shops.map((shop) => (
                <div key={shop.id} className="min-w-[280px] md:min-w-[320px] snap-start flex-shrink-0">
                  <FarmCard shop={shop} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: "Gợi ý cho bạn" — Shopee-style product grid */}
        <section className="mb-12 -mx-4 px-4 py-8 bg-gradient-to-b from-primary-50/40 to-transparent dark:from-primary/5 dark:to-transparent rounded-3xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-primary uppercase tracking-widest">
              Gợi ý cho bạn
            </h2>
            <div className="w-20 h-0.5 bg-primary mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 product-grid-section">
            {(() => {
              const seen = new Set<string>();
              return [...seasonalProducts, ...newProducts].filter((p) => {
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
              }).map((product) => (
                <ProductCard key={`suggest-${product.id}`} product={product} />
              ));
            })()}
          </div>
        </section>
      </main>
    </>
  );
}
