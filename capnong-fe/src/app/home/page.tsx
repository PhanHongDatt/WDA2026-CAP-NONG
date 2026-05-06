import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import FarmCard from "@/components/ui/FarmCard";
import HeroBanner from "@/components/ui/HeroBanner";
import ProductionJourney from "@/components/ui/ProductionJourney";
import CategoryGrid from "@/components/ui/CategoryGrid";
import { LeafIcon } from "@/components/ui/icons/LeafIcon";
import { productService, shopService } from "@/services";
import { getRandomProducts } from "@/services/api/product";
import { MOCK_SEASONAL_PRODUCTS, MOCK_NEW_PRODUCTS, MOCK_SHOPS } from "@/lib/mock-data";



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
  const [seasonalProducts, newProducts, shops, randomProducts] = await Promise.all([
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

    getRandomProducts(10).then((result) => {
      if (result && result.length > 0) return result;
      // Fallback to mock data if random API fails or is empty
      return [...MOCK_SEASONAL_PRODUCTS, ...MOCK_NEW_PRODUCTS].slice(0, 10);
    }).catch(() => [...MOCK_SEASONAL_PRODUCTS, ...MOCK_NEW_PRODUCTS].slice(0, 10)),
  ]);
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO SECTION — Full-width farm background + mascot */}
      <HeroBanner />

      {/* HÀNH TRÌNH NÔNG SẢN — Farm-to-table story timeline */}
      <ProductionJourney />

      {/* CATEGORY GRID — Shopee-style "DANH MỤC" (below fold → content-visibility) */}
      <div>
        <CategoryGrid />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-2 relative">
        {/* Floating leaf decoration removed as requested */}

        {/* SVG Filter for Torn Paper (Gợi ý cho bạn) */}
        <svg width="0" height="0" className="absolute pointer-events-none">
          <filter id="torn-paper" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        {/* SECTION: Seasonal Products */}
        <section className="-mx-4 px-4 py-10 md:py-[30px] xl:py-[40px]  rounded-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
            <div>
              <h2 className="journey-title text-left">
                <span className="journey-title-text">
                  Nông sản đang mùa tại{" "}
                  <span className="journey-title-highlight">
                    Cạp Nông
                    {/* Paint-stroke underline */}
                    <svg className="journey-paint-stroke" viewBox="0 0 120 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M2 8 C20 3, 40 10, 60 6 S100 3, 118 7" stroke="var(--color-primary, #2E7D32)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.35"/>
                    </svg>
                  </span>
                </span>
                <LeafIcon />
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  { label: "Tất cả", href: "/catalog?status=IN_SEASON" },
                  { label: "Trái cây", href: "/catalog?status=IN_SEASON&category=FRUIT" },
                  { label: "Rau củ", href: "/catalog?status=IN_SEASON&category=VEGETABLE" },
                  { label: "Thủy hải sản", href: "/catalog?status=IN_SEASON&category=SEAFOOD" },
                ].map((cat, i) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className={
                      i === 0
                        ? "px-4 sm:px-5 py-1.5 rounded-full bg-primary text-white text-xs sm:text-sm font-medium"
                        : "px-4 sm:px-5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-200"
                    }
                  >
                    {cat.label}
                  </Link>
                ))}
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

        <section className="py-10 md:py-[60px] xl:py-[80px] relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="journey-title text-left">
                <span className="journey-title-text">
                  Sản phẩm{" "}
                  <span className="journey-title-highlight">
                    mới
                    <svg className="journey-paint-stroke" viewBox="0 0 120 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M2 8 C20 3, 40 10, 60 6 S100 3, 118 7" stroke="var(--color-primary, #2E7D32)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.35"/>
                    </svg>
                  </span>
                </span>
                <LeafIcon />
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



        {/* SECTION: Featured Farms — giống hình tham khảo carousel */}
        <section className="py-10 md:py-[60px] xl:py-[80px] relative">
          {/* Roof tile decorative border using the actual roof SVG */}
          {/* Roof tile decorative border using the actual roof SVG */}
          <div
            className="w-full mb-8"
            style={{
              height: '32px',
              backgroundImage: 'url(/images/farms/roof-red-white.svg)',
              backgroundSize: '320px 100%',
              backgroundPosition: 'top left',
              backgroundRepeat: 'repeat-x',
              opacity: 0.9,
            }}
            aria-hidden="true"
          />
          <div className="text-center mb-6">
            <h2 className="journey-title">
              <span className="journey-title-text">
                Khám phá{" "}
                <span className="journey-title-highlight">
                  nhà cung cấp
                  <svg className="journey-paint-stroke" viewBox="0 0 120 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M2 8 C20 3, 40 10, 60 6 S100 3, 118 7" stroke="var(--color-primary, #2E7D32)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.35"/>
                  </svg>
                </span>{" "}
                dành riêng cho bạn!
              </span>
              <LeafIcon />
            </h2>
          </div>
          {/* Grid layout — 4 equal cards */}
          <div className="relative group/carousel">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {shops.slice(0, 3).map((shop) => (
                <div key={shop.id}>
                  <FarmCard shop={shop} />
                </div>
              ))}
              
              {/* Solid Color CTA Block — matches FarmCard height */}
              <div>
                <div className="h-full bg-primary rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-md relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight">
                    Bạn muốn trở thành<br/>nhà vườn ở Cạp Nông?
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-5 max-w-[220px]">
                    Đăng ký ngay để mang nông sản sạch của bạn đến hàng ngàn khách hàng!
                  </p>
                  <Link href="/register?role=FARMER" className="bg-white text-primary px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors duration-300 shadow-sm active:scale-95">
                    Đăng Ký Ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: "Gợi ý cho bạn" — Shopee-style product grid */}
        <section className="mb-20 -mx-4 px-9 pb-28 md:pt-[40px] md:pb-[40px] xl:pt-[50px] xl:pb-[50px] relative z-0">
          <div className="!absolute inset-0 journey-content [filter:url(#torn-paper)] z-[-1] mx-4 rounded-3xl" />
          <div className="text-center mb-6">
            <h2 className="journey-title">
              <span className="journey-title-text">
                Gợi ý{" "}
                <span className="journey-title-highlight">
                  cho bạn
                  <svg className="journey-paint-stroke" viewBox="0 0 120 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M2 8 C20 3, 40 10, 60 6 S100 3, 118 7" stroke="var(--color-primary, #2E7D32)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.35"/>
                  </svg>
                </span>
              </span>
              <LeafIcon />
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 product-grid-section">
            {randomProducts.map((product) => (
              <ProductCard key={`suggest-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
