"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Footer — updated with real links, logo, and social media "coming soon" modal
 */
export default function Footer() {
  const [showModal, setShowModal] = useState(false);
  const [socialName, setSocialName] = useState("");

  const handleSocialClick = (name: string) => {
    setSocialName(name);
    setShowModal(true);
  };

  return (
    <>
      <footer className="bg-gray-50 dark:bg-surface pt-12 pb-6 relative mt-10">
        {/* Torn Edge Top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[99%] footer-torn-edge">
          <svg
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-8 sm:h-10 block"
            aria-hidden="true"
          >
            <path
              d={`M0 40 L0 28 
              C2 28, 4 26, 8 27 C12 28, 14 25, 18 26 C22 27, 24 24, 28 25 
              C32 26, 36 23, 40 24 C44 25, 46 22, 50 23 C54 24, 58 21, 62 22 
              C66 23, 68 26, 72 25 C76 24, 80 27, 84 26 C88 25, 92 28, 96 27 
              C100 26, 104 23, 108 24 C112 25, 114 22, 118 21 C122 20, 126 23, 130 24 
              C134 25, 138 22, 142 23 C146 24, 148 27, 152 26 C156 25, 160 28, 164 27 
              C168 26, 172 24, 176 25 C180 26, 182 23, 186 22 C190 21, 194 24, 198 25 
              C202 26, 206 23, 210 22 C214 21, 218 24, 222 25 C226 26, 228 28, 232 27 
              C236 26, 240 23, 244 24 C248 25, 252 22, 256 23 C260 24, 264 27, 268 26 
              C272 25, 276 22, 280 23 C284 24, 288 21, 292 22 C296 23, 300 26, 304 25 
              C308 24, 312 27, 316 26 C320 25, 324 22, 328 23 C332 24, 336 21, 340 22 
              C344 23, 348 26, 352 25 C356 24, 360 27, 364 26 C368 25, 372 23, 376 24 
              C380 25, 384 22, 388 23 C392 24, 396 27, 400 26 C404 25, 408 28, 412 27 
              C416 26, 420 23, 424 24 C428 25, 432 22, 436 21 C440 20, 444 23, 448 24 
              C452 25, 456 28, 460 27 C464 26, 468 23, 472 24 C476 25, 480 22, 484 23 
              C488 24, 492 27, 496 26 C500 25, 504 22, 508 23 C512 24, 516 21, 520 22 
              C524 23, 528 26, 532 25 C536 24, 540 27, 544 26 C548 25, 552 22, 556 23 
              C560 24, 564 21, 568 22 C572 23, 576 26, 580 25 C584 24, 588 27, 592 26 
              C596 25, 600 23, 604 24 C608 25, 612 22, 616 23 C620 24, 624 27, 628 26 
              C632 25, 636 28, 640 27 C644 26, 648 23, 652 24 C656 25, 660 22, 664 21 
              C668 20, 672 23, 676 24 C680 25, 684 28, 688 27 C692 26, 696 23, 700 24 
              C704 25, 708 22, 712 23 C716 24, 720 27, 724 26 C728 25, 732 22, 736 23 
              C740 24, 744 21, 748 22 C752 23, 756 26, 760 25 C764 24, 768 27, 772 26 
              C776 25, 780 22, 784 23 C788 24, 792 21, 796 22 C800 23, 804 26, 808 25 
              C812 24, 816 27, 820 26 C824 25, 828 23, 832 24 C836 25, 840 22, 844 23 
              C848 24, 852 27, 856 26 C860 25, 864 28, 868 27 C872 26, 876 23, 880 24 
              C884 25, 888 22, 892 21 C896 20, 900 23, 904 24 C908 25, 912 28, 916 27 
              C920 26, 924 23, 928 24 C932 25, 936 22, 940 23 C944 24, 948 27, 952 26 
              C956 25, 960 22, 964 23 C968 24, 972 21, 976 22 C980 23, 984 26, 988 25 
              C992 24, 996 27, 1000 26 C1004 25, 1008 22, 1012 23 C1016 24, 1020 21, 1024 22 
              C1028 23, 1032 26, 1036 25 C1040 24, 1044 27, 1048 26 C1052 25, 1056 23, 1060 24 
              C1064 25, 1068 22, 1072 23 C1076 24, 1080 27, 1084 26 C1088 25, 1092 28, 1096 27 
              C1100 26, 1104 23, 1108 24 C1112 25, 1116 22, 1120 21 C1124 20, 1128 23, 1132 24 
              C1136 25, 1140 28, 1144 27 C1148 26, 1152 23, 1156 24 C1160 25, 1164 22, 1168 23 
              C1172 24, 1176 27, 1180 26 C1184 25, 1188 22, 1192 23 C1196 24, 1200 26, 1200 25 
              L1200 40 Z`}
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Grid 4 cols */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/images/logo.png"
                  alt="Cạp Nông Logo"
                  className="w-12 h-12 object-contain"
                />
                <h4 className="font-black text-primary text-xl">CẠP NÔNG</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-foreground-muted leading-relaxed">
                Kết nối trực tiếp nông sản từ vườn đến bàn ăn. Đảm bảo chất
                lượng, minh bạch nguồn gốc và giá cả hợp lý nhất.
              </p>
            </div>

            {/* About */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Về Cạp Nông</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
                <li><Link className="hover:text-primary transition-colors" href="/home">Trang chủ</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/catalog">Sản phẩm</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/cooperative">Hợp tác xã số</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/shops">Gian hàng</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Hỗ trợ khách hàng</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
                <li><Link className="hover:text-primary transition-colors" href="/orders/lookup">Tra cứu đơn hàng</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/profile">Tài khoản của tôi</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/register">Đăng ký tài khoản</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/login">Đăng nhập</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-foreground mb-4">Dành cho nông dân</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-foreground-muted">
                <li><Link className="hover:text-primary transition-colors" href="/dashboard">Quản lý gian hàng</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/dashboard/products/new">Đăng sản phẩm</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/shops/new">Tạo gian hàng</Link></li>
                <li><Link className="hover:text-primary transition-colors" href="/cooperative/create">Thành lập HTX</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 dark:border-border pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-foreground-muted gap-4">
            <p>© 2026 Cạp Nông. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleSocialClick("Facebook")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick("Zalo")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                Zalo
              </button>
              <button
                type="button"
                onClick={() => handleSocialClick("TikTok")}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                TikTok
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-border p-8 max-w-sm w-full mx-4 text-center animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo */}
            <img
              src="/images/logo.png"
              alt="Cạp Nông Logo"
              className="w-20 h-20 object-contain mx-auto mb-4"
            />

            {/* Title */}
            <h3 className="text-xl font-black text-gray-900 dark:text-foreground mb-2">
              🚧 Tính năng đang phát triển
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-foreground-muted mb-6 leading-relaxed">
              Kết nối qua <span className="font-bold text-primary">{socialName}</span> sẽ sớm được
              ra mắt. Cạp Nông đang nỗ lực hoàn thiện để phục vụ bạn tốt hơn!
            </p>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-primary text-white font-bold px-8 py-2.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
