import Link from "next/link";

/**
 * Footer — matching home.html lines 422-468 exactly
 */
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Grid 4 cols — home.html line 425 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h4 className="font-black text-primary text-xl mb-4">CẠP NÔNG</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Kết nối trực tiếp nông sản từ vườn đến bàn ăn. Đảm bảo chất
              lượng, minh bạch nguồn gốc và giá cả hợp lý nhất.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Về Cạp Nông</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-primary" href="#">Câu chuyện thương hiệu</a></li>
              <li><a className="hover:text-primary" href="#">Liên hệ</a></li>
              <li><a className="hover:text-primary" href="#">Hệ thống phân phối</a></li>
              <li><a className="hover:text-primary" href="#">Tuyển dụng</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-primary" href="#">Câu hỏi thường gặp</a></li>
              <li><a className="hover:text-primary" href="#">Hướng dẫn mua hàng</a></li>
              <li><a className="hover:text-primary" href="#">Khiếu nại &amp; Góp ý</a></li>
              <li><a className="hover:text-primary" href="#">Trung tâm hỗ trợ</a></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Chính sách</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-primary" href="#">Chính sách thanh toán</a></li>
              <li><a className="hover:text-primary" href="#">Chính sách giao hàng</a></li>
              <li><a className="hover:text-primary" href="#">Chính sách bảo mật</a></li>
              <li><a className="hover:text-primary" href="#">Chính sách hoàn tiền</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>© 2024 Cạp Nông. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <span className="hover:text-primary cursor-pointer">Facebook</span>
            <span className="hover:text-primary cursor-pointer">Zalo</span>
            <span className="hover:text-primary cursor-pointer">TikTok</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
