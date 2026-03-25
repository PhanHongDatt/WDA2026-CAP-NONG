import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ClientProviders from "@/components/layout/ClientProviders";

const SITE_URL = "https://capnong.vn";

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
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <ClientProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}

