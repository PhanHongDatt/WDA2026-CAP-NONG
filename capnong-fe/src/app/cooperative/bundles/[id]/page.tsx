"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBundleDetail, addPledge, withdrawPledge } from "@/services/api/htx";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Package, User, Users, CheckCircle2, Clock, MapPin, Store, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BundleDetailPage() {
  const params = useParams();
  const bundleId = params.id as string;
  const { user } = useAuth();
  
  const [bundle, setBundle] = useState<any>(null);
  const [pledges, setPledges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pledge state
  const [pledgeKg, setPledgeKg] = useState("");
  const [pledging, setPledging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getBundleDetail(bundleId);
      setBundle(data.bundle);
      setPledges(data.pledges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [bundleId]);

  const handlePledge = async () => {
    if (!pledgeKg || Number(pledgeKg) <= 0) return;
    setPledging(true);
    setError(null);
    try {
      await addPledge(bundleId, Number(pledgeKg));
      setPledgeKg("");
      await fetchDetail();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Cam kết thất bại");
    } finally {
      setPledging(false);
    }
  };

  const handleWithdraw = async (pledgeId: string) => {
    if (!confirm("Bạn có chắc chắn muốn rút cam kết này?")) return;
    try {
      await withdrawPledge(pledgeId);
      await fetchDetail();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "Rút cam kết thất bại");
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;
  if (!bundle) return <div className="text-center py-20">Không tìm thấy thông tin gói</div>;

  const progress = Math.min(100, Math.round(((bundle.current_pledged_quantity || 0) / bundle.target_quantity) * 100));
  const isFarmer = user?.role === "FARMER" || user?.role === "HTX_MEMBER";
  const myPledges = pledges.filter((p: any) => p.farmer?.id === user?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cooperative" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">Chi tiết Gom đơn</h1>
          <p className="text-gray-500 dark:text-foreground-muted text-sm mt-1">{bundle.orderCode || bundle.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface border border-gray-100 dark:border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full mb-3 uppercase tracking-wider ${
                  bundle.status === "OPEN" ? "bg-blue-50 text-blue-700" :
                  bundle.status === "FULL" ? "bg-amber-50 text-amber-700" :
                  bundle.status === "CONFIRMED" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                  {bundle.status}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">{bundle.product_name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {bundle.product_category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Hạn: {new Date(bundle.deadline).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Giá thu mua</p>
                <p className="text-2xl font-black text-amber-600">{formatCurrency(bundle.price_per_unit)}/{bundle.unit_code}</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-foreground-muted text-sm mt-4 bg-gray-50 dark:bg-surface-hover p-4 rounded-xl border border-gray-100 dark:border-border leading-relaxed">
              {bundle.description || "Chưa có mô tả chi tiết."}
            </p>

            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Tiến độ gom đơn</p>
                  <p className="font-bold text-gray-900 dark:text-foreground mt-1">
                    {bundle.current_pledged_quantity || 0} / {bundle.target_quantity} <span className="text-sm font-normal text-gray-500">{bundle.unit_code}</span>
                  </p>
                </div>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface border border-gray-100 dark:border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Thành viên cam kết
            </h3>
            
            {pledges.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">Chưa có thành viên nào cam kết.</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-border flex flex-col">
                {pledges.map((p) => (
                  <div key={p.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-foreground">
                          {p.farmer?.id === user?.id ? "Bạn" : p.farmer?.full_name || "Ẩn danh"}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{new Date(p.created_at).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-foreground">{p.quantity} {bundle.unit_code}</p>
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold ${
                        p.status === "ACTIVE" ? "bg-green-50 text-green-700" :
                        p.status === "WITHDRAWN" ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-700"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-surface border border-gray-100 dark:border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-400" /> Hành động
            </h3>

            {String(user?.role) === "WHOLESALE_BUYER" || String(user?.role) === "USER" ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-800">
                <p className="font-medium mb-1">🛒 Dành cho người mua سỉ</p>
                <p className="mb-3 text-amber-700 opacity-90">Sản phẩm này thuộc HTX và được bán qua HTX Shop.</p>
                {bundle.shopId && (
                  <Link href={`/shop/${bundle.shopId}`} className="block w-full py-2.5 bg-amber-500 text-white text-center rounded-lg font-bold hover:bg-amber-600 transition-colors">
                    Đến HTX Shop mua hàng
                  </Link>
                )}
              </div>
            ) : isFarmer ? (
              bundle.status === "OPEN" ? (
                <div className="space-y-3">
                  {error && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nhập số lượng cam kết ({bundle.unitCode})</label>
                    <input 
                      type="number" 
                      value={pledgeKg} 
                      onChange={(e) => setPledgeKg(e.target.value)} 
                      min={bundle.min_pledge_quantity || 1}
                      placeholder={`Tối thiểu ${bundle.min_pledge_quantity || 1}`}
                      className="w-full px-4 py-2 border rounded-xl"
                    />
                  </div>
                  <button 
                    onClick={handlePledge}
                    disabled={pledging || !pledgeKg}
                    className="w-full bg-primary text-white font-bold py-2.5 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {pledging ? "Đang xử lý..." : "Tham gia gom đơn"}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-500 text-center">
                  Gói gom đơn không còn nhận thêm cam kết
                </div>
              )
            ) : (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-500 text-center">
                Vui lòng đăng nhập với tài khoản Hợp tác xã hoặc Nông dân để tham gia.
              </div>
            )}
          </div>

          {myPledges.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-green-800 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Cam kết của bạn
              </h3>
              <div className="space-y-3">
                {myPledges.map(p => (
                  <div key={p.id} className="bg-white/60 p-3 rounded-lg border border-green-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-green-900">{p.quantity} {bundle.unit_code}</p>
                      <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider">{p.status}</p>
                    </div>
                    {p.status === "ACTIVE" && bundle.status === "OPEN" && (
                      <button 
                        onClick={() => handleWithdraw(p.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                      >
                        Rút lại
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
