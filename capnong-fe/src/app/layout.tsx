import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ClientProviders from "@/components/layout/ClientProviders";

const publicSans = Public_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-display",
  preload: true,
});
const SITE_URL = "https://capnong.shop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Cạp Nông — Nông sản từ nông trại đến bàn ăn",
    template: "%s | Cạp Nông",
  },

  description:
    "Hệ sinh thái thương mại nông sản thông minh. Kết nối trực tiếp nhà vườn và người tiêu dùng, đảm bảo chất lượng và minh bạch nguồn gốc.",

  keywords: [
    "nông sản sạch",
    "hữu cơ",
    "trái cây",
    "rau củ",
    "từ vườn đến bàn ăn",
    "gom đơn",
    "hợp tác xã",
    "truy xuất nguồn gốc",
    "nông sản Việt Nam",
    "mua nông sản online",
  ],

  authors: [{ name: "Cạp Nông Team" }],
  creator: "Cạp Nông",
  publisher: "Cạp Nông",

  // Open Graph — Facebook, Zalo
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "Cạp Nông",
    title: "Cạp Nông — Nông sản từ nông trại đến bàn ăn",
    description:
      "Kết nối trực tiếp nhà vườn ĐBSCL và người tiêu dùng. Truy xuất nguồn gốc minh bạch, gom đơn tiết kiệm.",
    images: [
      {
        url: "/images/banners/banner-traicay.png",
        width: 1200,
        height: 630,
        alt: "Cạp Nông — Nông sản sạch từ nông trại",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Cạp Nông — Nông sản từ nông trại đến bàn ăn",
    description: "Kết nối nhà vườn và người tiêu dùng, minh bạch nguồn gốc.",
    images: ["/images/banners/banner-traicay.png"],
  },

  // PWA manifest
  manifest: "/manifest.json",

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification (placeholder)
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_CODE",
  // },

  // Favicon + Icons
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E7D32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* DNS prefetch + preconnect to backend API for faster first request */}
        <link rel="dns-prefetch" href="//localhost:8080" />
        <link rel="preconnect" href="http://localhost:8080" crossOrigin="anonymous" />
        {/* Anti-FOUC: Apply dark mode BEFORE first paint to prevent white flash
            Ref: web.dev/prefers-color-scheme — "blocking script" pattern */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('capnong-theme');if(t==='dark'){document.documentElement.classList.add('dark')}var f=localStorage.getItem('capnong-font-size');if(f){document.documentElement.classList.add('font-'+f)}}catch(e){}})();
            if(!window.crypto){window.crypto={}}if(!window.crypto.randomUUID){window.crypto.randomUUID=function(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16)})}}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${publicSans.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <ClientProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}

