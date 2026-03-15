'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="home-container">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1>🌾 Dashboard</h1>
        <button className="btn btn-outline" onClick={logout}>
          Đăng xuất
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Thông tin tài khoản</h2>
        <p>
          <strong>Username:</strong> {user?.username}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Chào mừng đến với Cạp Nông!</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Nền tảng đang trong quá trình phát triển. Các tính năng sẽ sớm được
          cập nhật.
        </p>
      </div>
    </div>
  );
}
