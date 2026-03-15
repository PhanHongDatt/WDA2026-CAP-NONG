import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-container">
      <h1>🌾 Cạp Nông</h1>
      <p>
        Nền tảng nông nghiệp thông minh tích hợp AI, hỗ trợ nông dân Việt Nam
        quản lý và tối ưu hóa sản xuất nông nghiệp.
      </p>
      <div className="home-actions">
        <Link href="/login" className="btn btn-primary">
          Đăng nhập
        </Link>
        <Link href="/register" className="btn btn-outline">
          Đăng ký
        </Link>
      </div>
    </div>
  );
}
