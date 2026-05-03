"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Users,
  TrendingUp,
  Plus,
  Package,
  CheckCircle2,
  XCircle,
  UserPlus,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  AlertCircle,
  DollarSign,
  Shield,
  ArrowRightLeft,
  AlertTriangle,
  ShoppingCart,
  Pencil,
  Eye,
  EyeOff,
  ClipboardList,
  Loader2,
  Truck,
  Clock,
  Check,
  Ban,
} from "lucide-react";
import ProductEditModal from "@/app/dashboard/products/ProductEditModal";
import { formatCurrency } from "@/lib/utils";
import ProgressBar from "@/components/ui/ProgressBar";

/* ─── Product Category enum (khớp BE ProductCategory) ─── */
const PRODUCT_CATEGORIES = [
  { code: "FRUIT", label: "Trái cây" },
  { code: "VEGETABLE", label: "Rau củ" },
  { code: "GRAIN", label: "Ngũ cốc" },
  { code: "TUBER", label: "Củ" },
  { code: "HERB", label: "Thảo mộc" },
  { code: "OTHER", label: "Khác" },
];

/* ─── Types ─── */
type ManageTab = "overview" | "members" | "bundles" | "products" | "orders" | "seasonal" | "admin";

/* ─── Mock Data ─── */
const MOCK_MEMBERS = [
  {
    id: "m-001",
    name: "Bác Ba Nhà Vườn",
    phone: "0902222222",
    product: "Cam sành",
    qty: 200,
    share: "20%",
    joined_at: "2026-01-15",
  },
  {
    id: "m-002",
    name: "Chú Tư Bến Tre",
    phone: "0903333333",
    product: "Bưởi da xanh",
    qty: 350,
    share: "35%",
    joined_at: "2026-01-20",
  },
  {
    id: "m-003",
    name: "Cô Năm Vĩnh Long",
    phone: "0907777777",
    product: "Cam sành",
    qty: 150,
    share: "15%",
    joined_at: "2026-02-01",
  },
  {
    id: "m-004",
    name: "Anh Sáu Cần Thơ",
    phone: "0908888888",
    product: "Xoài cát",
    qty: 300,
    share: "30%",
    joined_at: "2026-02-18",
  },
];

type JoinStatus = "PENDING" | "APPROVED" | "REJECTED";
const MOCK_JOIN_REQUESTS: {
  id: string;
  name: string;
  phone: string;
  reason: string;
  created_at: string;
  status: JoinStatus;
}[] = [
  {
    id: "jr-001",
    name: "Trần Văn Minh",
    phone: "0911111111",
    reason: "Muốn tham gia gom đơn bán sỉ cam sành",
    created_at: "2026-03-19T10:00:00Z",
    status: "PENDING",
  },
  {
    id: "jr-002",
    name: "Lê Thị Hồng",
    phone: "0922222222",
    reason: "Có 2 hecta vườn bưởi, muốn hợp tác tiêu thụ",
    created_at: "2026-03-20T08:00:00Z",
    status: "PENDING",
  },
];

type BundleStatus = "OPEN" | "FULL" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
type PledgeStatus =
  | "COMMITTED"
  | "DELIVERED"
  | "PARTIAL"
  | "ACTIVE"
  | "WITHDRAWN"
  | "EXPIRED";

interface Pledge {
  id: string;
  farmer_name: string;
  farmer_phone: string;
  quantity_kg: number;
  contribution_percent?: number;
  estimated_revenue?: number;
  status: PledgeStatus;
  note?: string;
  created_at: string;
}

interface Bundle {
  id: string;
  product_name: string;
  target_kg: number;
  current_kg: number;
  price_per_kg: number;
  deadline: string;
  status: BundleStatus;
  pledges: Pledge[];
}

const MOCK_BUNDLES: Bundle[] = [
  {
    id: "b-001",
    product_name: "Cam Sành Hà Giang",
    target_kg: 500,
    current_kg: 350,
    price_per_kg: 35000,
    deadline: "2026-04-01",
    status: "OPEN",
    pledges: [
      {
        id: "p-001",
        farmer_name: "Bác Ba Nhà Vườn",
        farmer_phone: "0902222222",
        quantity_kg: 150,
        status: "COMMITTED",
        created_at: "2026-03-20",
      },
      {
        id: "p-002",
        farmer_name: "Cô Năm Vĩnh Long",
        farmer_phone: "0907777777",
        quantity_kg: 100,
        status: "DELIVERED",
        note: "Đã giao kho trung tâm",
        created_at: "2026-03-21",
      },
      {
        id: "p-003",
        farmer_name: "Anh Sáu Cần Thơ",
        farmer_phone: "0908888888",
        quantity_kg: 100,
        status: "PARTIAL",
        note: "Mới giao 60kg, còn 40kg",
        created_at: "2026-03-22",
      },
    ],
  },
  {
    id: "b-002",
    product_name: "Bưởi Da Xanh Bến Tre",
    target_kg: 300,
    current_kg: 300,
    price_per_kg: 55000,
    deadline: "2026-03-25",
    status: "FULL",
    pledges: [
      {
        id: "p-004",
        farmer_name: "Chú Tư Bến Tre",
        farmer_phone: "0903333333",
        quantity_kg: 200,
        status: "DELIVERED",
        created_at: "2026-03-18",
      },
      {
        id: "p-005",
        farmer_name: "Bác Ba Nhà Vườn",
        farmer_phone: "0902222222",
        quantity_kg: 50,
        status: "COMMITTED",
        created_at: "2026-03-19",
      },
      {
        id: "p-006",
        farmer_name: "Cô Năm Vĩnh Long",
        farmer_phone: "0907777777",
        quantity_kg: 30,
        status: "COMMITTED",
        created_at: "2026-03-20",
      },
      {
        id: "p-007",
        farmer_name: "Anh Sáu Cần Thơ",
        farmer_phone: "0908888888",
        quantity_kg: 20,
        status: "DELIVERED",
        created_at: "2026-03-21",
      },
    ],
  },
  {
    id: "b-003",
    product_name: "Xoài Cát Hòa Lộc",
    target_kg: 1000,
    current_kg: 200,
    price_per_kg: 45000,
    deadline: "2026-03-15",
    status: "EXPIRED",
    pledges: [
      {
        id: "p-008",
        farmer_name: "Anh Sáu Cần Thơ",
        farmer_phone: "0908888888",
        quantity_kg: 120,
        status: "PARTIAL",
        note: "Mất mùa, chỉ thu hoạch được 80kg",
        created_at: "2026-03-10",
      },
      {
        id: "p-009",
        farmer_name: "Bác Ba Nhà Vườn",
        farmer_phone: "0902222222",
        quantity_kg: 80,
        status: "COMMITTED",
        note: "Chưa tới vụ thu hoạch",
        created_at: "2026-03-12",
      },
    ],
  },
];

const MOCK_SEASONAL = [
  { id: 1, category: "Trái cây", start_month: 3, end_month: 9 },
  { id: 2, category: "Rau củ", start_month: 10, end_month: 2 },
];
const MONTHS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

const TAB_CONFIG = [
  { key: "overview" as ManageTab, label: "Tổng quan", icon: TrendingUp },
  { key: "members" as ManageTab, label: "Thành viên", icon: Users },
  { key: "bundles" as ManageTab, label: "Bundle gom đơn", icon: Package },
  { key: "products" as ManageTab, label: "Sản phẩm", icon: ShoppingCart },
  { key: "orders" as ManageTab, label: "Đơn hàng", icon: ClipboardList },
  { key: "seasonal" as ManageTab, label: "Mùa vụ", icon: Calendar },
  { key: "admin" as ManageTab, label: "Quản trị", icon: Shield },
];

function statusBadge(status: BundleStatus) {
  switch (status) {
    case "OPEN":
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "FULL":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "CONFIRMED":
      return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "EXPIRED":
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    case "CANCELLED":
      return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }
}
function statusLabel(status: BundleStatus) {
  switch (status) {
    case "OPEN":
      return "🟢 Đang mở";
    case "FULL":
      return "🟡 Đủ SL";
    case "CONFIRMED":
      return "✅ Đã xác nhận";
    case "EXPIRED":
      return "⏰ Hết hạn";
    case "CANCELLED":
      return "❌ Đã hủy";
  }
}
function pledgeStatusBadge(status: PledgeStatus): {
  label: string;
  class: string;
} {
  switch (status) {
    case "ACTIVE":
    case "COMMITTED":
      return {
        label: "✅ Đang hoạt động",
        class:
          "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      };
    case "DELIVERED":
      return {
        label: "📦 Đã giao",
        class:
          "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      };
    case "PARTIAL":
      return {
        label: "⚠️ Giao một phần",
        class:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      };
    case "WITHDRAWN":
      return {
        label: "🔙 Đã rút",
        class: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
      };
    case "EXPIRED":
      return {
        label: "⏰ Hết hạn",
        class: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
      };
    default:
      return { label: status, class: "bg-gray-100 text-gray-600" };
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/* ═════════════════════════════════════════ */
function CoopManageContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ManageTab>("overview");
  const [joinRequests, setJoinRequests] = useState(
    USE_MOCK ? MOCK_JOIN_REQUESTS : [],
  );
  const [members, setMembers] = useState(USE_MOCK ? MOCK_MEMBERS : []);
  const [bundles, setBundles] = useState<Bundle[]>(
    USE_MOCK ? MOCK_BUNDLES : [],
  );
  const [seasonalConfig, setSeasonalConfig] = useState<
    { id: number | string; category: string; start_month: number; end_month: number; province?: string; note?: string; configured_by_username?: string }[]
  >(USE_MOCK ? MOCK_SEASONAL : []);
  const [showNewBundle, setShowNewBundle] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<
    { code: string; name: string }[]
  >([{ code: "KG", name: "Kilogram" }]);
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);

  // Products state
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // HTX shop info
  const [htxShopId, setHtxShopId] = useState<string | null>(null);
  const [htxShopSlug, setHtxShopSlug] = useState<string | null>(null);

  // Orders state
  const [htxOrders, setHtxOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [hasHtxShop, setHasHtxShop] = useState(false);
  const [isActivatingShop, setIsActivatingShop] = useState(false);

  /* ─── API Fetch (fallback to mock) ─── */
  const fetchData = useCallback(async () => {
    try {
      const htxApi = await import("@/services/api/htx");
      const unitApi = await import("@/services/api/unit");
      const shopApi = await import("@/services/api/shop");
      const seasonalApi = await import("@/services/api/seasonal-config");
      const [apiMembers, apiBundles, apiJoinReqs, apiUnits, myShops, apiSeasonalConfigs] =
        await Promise.all([
          htxApi.getHtxMembers().catch(() => []),
          htxApi.getMyHtxBundles().catch(() => []),
          htxApi.getPendingJoinRequests().catch(() => []),
          unitApi.getAllUnits().catch(() => []),
          shopApi.getAllMyShops().catch(() => []),
          seasonalApi.getAllSeasonalConfigs().catch(() => []),
        ]);

      // Update hasHtxShop & save HTX shop info
      if (Array.isArray(myShops)) {
        const htxShop = myShops.find((s: any) => s.isHtxShop || s.is_htx_shop);
        setHasHtxShop(!!htxShop);
        if (htxShop) {
          setHtxShopId(htxShop.id);
          setHtxShopSlug(htxShop.slug);
        }
      }

      // Map units
      if (Array.isArray(apiUnits) && apiUnits.length > 0) {
        setAvailableUnits(
          apiUnits.map((u: { code: string; name: string }) => ({
            code: u.code,
            name: u.name,
          })),
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (Array.isArray(apiMembers) && apiMembers.length > 0) {
        setMembers(
          apiMembers.map((m: any) => ({
            id: String(m.id || ""),
            name: m.full_name || m.fullName || m.username || "",
            phone: m.phone || "",
            product: "",
            qty: 0,
            share: "",
            joined_at: m.created_at || m.createdAt || "",
          })),
        );
      }
      if (Array.isArray(apiBundles) && apiBundles.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setBundles(
          apiBundles.map((b: any) => ({
            id: String(b.id || ""),
            product_name: b.product_name || "",
            target_kg: Number(b.target_quantity) || 0,
            current_kg: Number(b.current_pledged_quantity) || 0,
            price_per_kg: Number(b.price_per_unit) || 0,
            deadline: b.deadline || "",
            status: (b.status || "OPEN") as BundleStatus,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pledges: Array.isArray(b.pledges)
              ? b.pledges.map((p: any) => {
                  const farmer = p.farmer || {};
                  return {
                    id: String(p.id || ""),
                    farmer_name:
                      farmer.full_name ||
                      farmer.fullName ||
                      farmer.username ||
                      p.farmer_full_name ||
                      p.farmer_name ||
                      "",
                    farmer_phone: farmer.phone || p.farmer_phone || "",
                    quantity_kg: Number(p.quantity) || 0,
                    contribution_percent:
                      p.contribution_percent != null
                        ? Number(p.contribution_percent)
                        : undefined,
                    estimated_revenue:
                      p.estimated_revenue != null
                        ? Number(p.estimated_revenue)
                        : undefined,
                    status: (p.status || "ACTIVE") as PledgeStatus,
                    note: p.note || "",
                    created_at: p.created_at || "",
                  };
                })
              : [],
          })),
        );
      }
      // Map join requests — khớp BE HtxJoinRequestResponse fields (snake_case)
      if (Array.isArray(apiJoinReqs) && apiJoinReqs.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setJoinRequests(
          apiJoinReqs.map((r: any) => ({
            id: String(r.id || ""),
            name:
              r.farmer_full_name ||
              r.farmerFullName ||
              r.farmer_username ||
              r.farmerUsername ||
              "",
            phone: "", // BE HtxJoinRequestResponse không có phone
            reason: r.message || "",
            created_at: r.created_at || r.createdAt || "",
            status: (r.status || "PENDING") as JoinStatus,
          })),
        );
      }
      // Map seasonal configs from API
      if (Array.isArray(apiSeasonalConfigs) && apiSeasonalConfigs.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSeasonalConfig(
          apiSeasonalConfigs.map((sc: any) => ({
            id: sc.id,
            category: sc.product_category || sc.productCategory || "",
            start_month: sc.start_month || sc.startMonth || 1,
            end_month: sc.end_month || sc.endMonth || 12,
            province: sc.province || "",
            note: sc.note || "",
            configured_by_username: sc.configured_by_username || "",
          })),
        );
      }

      // Fetch HTX shop products (shop-specific, not all seller products)
      const htxShopFound = Array.isArray(myShops) ? myShops.find((s: any) => s.isHtxShop || s.is_htx_shop) : null;
      if (htxShopFound?.slug) {
        try {
          const shopApiAgain = await import("@/services/api/shop");
          const htxProducts = await shopApiAgain.apiShopService.getProducts(htxShopFound.slug);
          setSellerProducts(htxProducts || []);
        } catch {
          setSellerProducts([]);
        }
      } else {
        setSellerProducts([]);
      }

      // Fetch HTX shop orders
      if (htxShopFound?.id) {
        try {
          const orderApi = await import("@/services/api/order");
          const ordersData: any = await orderApi.getShopSubOrders(htxShopFound.id, { size: 50 });
          const orderList = ordersData?.content || (Array.isArray(ordersData) ? ordersData : []);
          setHtxOrders(orderList);
        } catch {
          setHtxOrders([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch manage data:", err);
      // No mock fallback — show empty state instead
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30s so manager sees new join requests without F5
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // New bundle form
  const [newProduct, setNewProduct] = useState("");
  const [newCategory, setNewCategory] = useState("FRUIT");
  const [newUnitCode, setNewUnitCode] = useState("KG");
  const [newTarget, setNewTarget] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleActivateHtxShop = async () => {
    setIsActivatingShop(true);
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.activateHtxShop();
      setHasHtxShop(true);
      setActionMessage({
        type: "success",
        text: "Gian hàng HTX đã được kích hoạt thành công!",
      });
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Lỗi kích hoạt gian hàng HTX",
      });
    } finally {
      setIsActivatingShop(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  /* join request review state & actions */
  const [reviewModalData, setReviewModalData] = useState<{
    id: string;
    action: "APPROVE" | "REJECT";
  } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const confirmReviewJoin = async () => {
    if (!reviewModalData) return;
    const { id, action } = reviewModalData;
    setIsReviewing(true);

    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.handleJoinRequest(id, action, reviewNote);
      setJoinRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === "APPROVE" ? "APPROVED" : "REJECTED" }
            : r,
        ),
      );
      setActionMessage({
        type: "success",
        text:
          action === "APPROVE"
            ? "Đã duyệt đơn gia nhập!"
            : "Đã từ chối đơn gia nhập!",
      });
    } catch (err: any) {
      setActionMessage({ type: "error", text: "Lỗi xử lý đơn gia nhập" });
    } finally {
      setIsReviewing(false);
      setReviewModalData(null);
      setReviewNote("");
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  /* bundle actions → API + optimistic */
  const handleConfirmBundle = async (id: string) => {
    setBundles((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "CONFIRMED" as BundleStatus } : b,
      ),
    );
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.confirmBundle(id);
    } catch {
      /* optimistic */
    }
  };
  const handleCancelBundle = async (id: string) => {
    setBundles((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "CANCELLED" as BundleStatus } : b,
      ),
    );
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.cancelBundle(id);
    } catch {
      /* optimistic */
    }
  };
  const handleCreateBundle = async () => {
    if (!newProduct.trim() || !newTarget || !newPrice) {
      setActionMessage({
        type: "error",
        text: "Vui lòng điền đầy đủ: Loại nông sản, Mục tiêu (kg), Giá/kg",
      });
      return;
    }

    // === CHỐT CHẶN: Validate deadline ngay tại Frontend ===
    const todayStr = new Date().toISOString().split("T")[0];
    const finalDeadline =
      newDeadline ||
      new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

    if (finalDeadline < todayStr) {
      setDeadlineError("Hạn chót phải từ hôm nay trở đi!");
      setActionMessage({
        type: "error",
        text: "❌ Hạn chót không hợp lệ — không được chọn ngày trong quá khứ!",
      });
      return;
    }
    setDeadlineError("");

    setIsCreating(true);
    try {
      const htxApi = await import("@/services/api/htx");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await htxApi.createBundle({
        productCategory: newCategory,
        productName: newProduct,
        unitCode: newUnitCode,
        targetQuantity: parseInt(newTarget),
        pricePerUnit: parseInt(newPrice),
        deadline: finalDeadline,
      });

      const newBundle: Bundle = {
        id: res?.id || `b-${Date.now()}`,
        product_name: res?.product_name || newProduct,
        target_kg: Number(res?.target_quantity) || parseInt(newTarget),
        current_kg: 0,
        price_per_kg: Number(res?.price_per_unit) || parseInt(newPrice),
        deadline: res?.deadline || finalDeadline,
        status: "OPEN",
        pledges: [],
      };

      setBundles((prev) => [newBundle, ...prev]);
      setShowNewBundle(false);
      setNewProduct("");
      setNewTarget("");
      setNewPrice("");
      setNewDeadline("");
      setNewCategory("FRUIT");
      setNewUnitCode("KG");
      setActionMessage({
        type: "success",
        text: "Tạo bundle gom đơn thành công!",
      });
    } catch (err: any) {
      // Parse lỗi validation từ backend (400 Bad Request)
      const backendData = err?.response?.data?.data;
      const backendMsg = err?.response?.data?.message;
      if (backendData && typeof backendData === "object") {
        // Backend trả field-level errors: { deadline: "...", productName: "..." }
        const msgs = Object.values(backendData).join("; ");
        setActionMessage({ type: "error", text: `❌ ${msgs}` });
        if (backendData.deadline) setDeadlineError(backendData.deadline);
      } else {
        setActionMessage({
          type: "error",
          text: `❌ ${backendMsg || "Lỗi tạo bundle"}`,
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const pendingJoin = joinRequests.filter((r) => r.status === "PENDING").length;
  const openBundles = bundles.filter(
    (b) => b.status === "OPEN" || b.status === "FULL",
  ).length;

  const [confirmingKickId, setConfirmingKickId] = useState<string | null>(null);

  const handleKickMember = async (id: string, name: string) => {
    if (confirmingKickId !== id) {
      setConfirmingKickId(id);
      setTimeout(() => setConfirmingKickId(null), 5000); // auto-cancel after 5s
      return;
    }
    setConfirmingKickId(null);
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.removeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setActionMessage({
        type: "success",
        text: `Đã xóa thành viên "${name}" khỏi HTX thành công.`,
      });
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosMsg = (err as any)?.response?.data?.message;
      // BE check pledge ACTIVE: hiển thị lỗi rõ ràng
      const msg =
        axiosMsg ||
        (err instanceof Error
          ? err.message
          : "Không thể xóa thành viên. Vui lòng thử lại.");
      setActionMessage({ type: "error", text: msg });
    }
    setTimeout(() => setActionMessage(null), 5000);
  };

  /* ── Transfer / Dissolve state ── */
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedNewManager, setSelectedNewManager] = useState<string | null>(
    null,
  );
  const [isTransferring, setIsTransferring] = useState(false);
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false);
  const [dissolveText, setDissolveText] = useState("");
  const [isDissolvingHtx, setIsDissolvingHtx] = useState(false);

  const handleTransfer = async () => {
    if (!selectedNewManager) return;
    setIsTransferring(true);
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.transferOwnership(selectedNewManager);
      setActionMessage({
        type: "success",
        text: "✅ Đã chuyển quyền Chủ HTX thành công! Vui lòng đăng nhập lại để cập nhật quyền.",
      });
      setShowTransferModal(false);
      setSelectedNewManager(null);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosMsg = (err as any)?.response?.data?.message;
      setActionMessage({
        type: "error",
        text: axiosMsg || "Không thể chuyển quyền. Vui lòng thử lại.",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDissolve = async () => {
    setIsDissolvingHtx(true);
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.dissolveHtx();
      setActionMessage({
        type: "success",
        text: "✅ Đã giải tán HTX. Tất cả thành viên đã chuyển về FARMER. Vui lòng đăng nhập lại.",
      });
      setShowDissolveConfirm(false);
      setDissolveText("");
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosMsg = (err as any)?.response?.data?.message;
      setActionMessage({
        type: "error",
        text: axiosMsg || "Không thể giải tán HTX. Vui lòng thử lại.",
      });
    } finally {
      setIsDissolvingHtx(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground dark:text-foreground">
            Quản lý HTX 🏛️
          </h1>
          <p className="text-gray-600 dark:text-foreground-muted mt-1">
            {user?.htx_name || "HTX"} — Xin chào, {user?.full_name}
          </p>
        </div>
      </div>
      {/* Action feedback banner */}
      {actionMessage && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${
            actionMessage.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
          }`}
        >
          <span>
            {actionMessage.type === "success" ? "✅" : "❌"}{" "}
            {actionMessage.text}
          </span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="ml-3 opacity-60 hover:opacity-100 text-lg leading-none"
          >
            &times;
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Thành viên",
            value: members.length,
            icon: Users,
            color: "text-primary bg-primary-50 dark:bg-primary-dark",
          },
          {
            label: "Yêu cầu GN",
            value: pendingJoin,
            icon: UserPlus,
            color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
          },
          {
            label: "Bundle đang mở",
            value: openBundles,
            icon: Package,
            color: "text-info bg-blue-50 dark:bg-blue-900/30",
          },
          {
            label: "Doanh thu tháng",
            value: formatCurrency(
              bundles
                .filter((b) => b.status === "CONFIRMED")
                .reduce((sum, b) => sum + b.current_kg * b.price_per_kg, 0),
            ),
            icon: TrendingUp,
            color: "text-success bg-green-50 dark:bg-green-900/30",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-surface rounded-xl p-5 border border-gray-100 dark:border-border"
          >
            <div
              className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-foreground-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-border">
        <nav className="flex gap-0 overflow-x-auto">
          {TAB_CONFIG.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 dark:text-foreground-muted hover:text-gray-700 dark:hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "members" && pendingJoin > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingJoin}
                </span>
              )}
              {tab.key === "bundles" && openBundles > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {openBundles}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══ Tab: Tổng quan ═══ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {!hasHtxShop && (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-primary dark:text-primary-light mb-1">
                  Kích hoạt Gian hàng HTX
                </h3>
                <p className="text-sm text-gray-600 dark:text-foreground-muted">
                  Bạn cần kích hoạt Gian hàng HTX để các thành viên có thể đẩy
                  sản lượng lên và người mua có thể xem thông tin HTX của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={handleActivateHtxShop}
                disabled={isActivatingShop}
                className="shrink-0 bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {isActivatingShop ? "Đang kích hoạt..." : "Kích hoạt ngay"}
              </button>
            </div>
          )}

          {actionMessage && (
            <div
              className={`p-4 rounded-lg bg-${actionMessage.type === "success" ? "green" : "red"}-50 text-${actionMessage.type === "success" ? "green" : "red"}-700 border border-${actionMessage.type === "success" ? "green" : "red"}-200`}
            >
              {actionMessage.text}
            </div>
          )}

          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-border">
              <h2 className="text-lg font-bold text-gray-900 dark:text-foreground">
                Danh sách Thành viên
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-background-light text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">
                      SĐT
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase text-right">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-foreground">
                        {m.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-foreground-muted">
                        {m.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-foreground-muted">
                        {m.joined_at
                          ? new Date(m.joined_at).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {confirmingKickId === m.id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleKickMember(m.id, m.name)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition-colors"
                            >
                              Xác nhận xóa?
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingKickId(null)}
                              className="text-gray-400 hover:text-gray-600 text-xs"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleKickMember(m.id, m.name)}
                            className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
                            title="Xóa thành viên"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Thành viên (Duyệt yêu cầu) ═══ */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-foreground">
            Yêu cầu gia nhập HTX (
            {joinRequests.filter((r) => r.status === "PENDING").length} chờ
            duyệt)
          </h2>
          {joinRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-5"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-900 dark:text-foreground">
                      {req.name}
                    </p>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          : req.status === "APPROVED"
                            ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {req.status === "PENDING"
                        ? "⏳ Chờ"
                        : req.status === "APPROVED"
                          ? "✅ Đã duyệt"
                          : "❌ Từ chối"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-foreground-muted">
                    📱 {req.phone}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-foreground-muted">
                    &quot;{req.reason}&quot;
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                {req.status === "PENDING" && (
                  <div className="flex items-start gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setReviewModalData({ id: req.id, action: "APPROVE" })
                      }
                      className="flex items-center gap-1.5 bg-success text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReviewModalData({ id: req.id, action: "REJECT" })
                      }
                      className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <XCircle className="w-4 h-4" /> Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {joinRequests.length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có yêu cầu gia nhập nào</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Bundle gom đơn ═══ */}
      {activeTab === "bundles" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900 dark:text-foreground">
              Quản lý Bundle
            </h2>
            <button
              type="button"
              onClick={() => setShowNewBundle(!showNewBundle)}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Tạo Bundle mới
            </button>
          </div>

          {/* New Bundle Form */}
          {showNewBundle && (
            <div className="bg-white dark:bg-surface rounded-xl border-2 border-primary/20 p-6 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-foreground">
                🆕 Tạo Bundle gom đơn mới
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="bundle-product"
                    className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1"
                  >
                    Tên sản phẩm *
                  </label>
                  <input
                    id="bundle-product"
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    placeholder="VD: Cam Sành Hà Giang"
                    className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bundle-category"
                    className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1"
                  >
                    Loại sản phẩm *
                  </label>
                  <select
                    id="bundle-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="bundle-unit"
                    className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1"
                  >
                    Đơn vị tính *
                  </label>
                  <select
                    id="bundle-unit"
                    value={newUnitCode}
                    onChange={(e) => setNewUnitCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {availableUnits.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="bundle-target"
                    className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1"
                  >
                    Mục tiêu sản lượng *
                  </label>
                  <input
                    id="bundle-target"
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bundle-price"
                    className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1"
                  >
                    Giá/đơn vị (VNĐ) *
                  </label>
                  <input
                    id="bundle-price"
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="35000"
                    className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bundle-deadline"
                    className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1"
                  >
                    Deadline gom *
                  </label>
                  <input
                    id="bundle-deadline"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={newDeadline}
                    onChange={(e) => {
                      setNewDeadline(e.target.value);
                      const today = new Date().toISOString().split("T")[0];
                      if (e.target.value && e.target.value < today) {
                        setDeadlineError("Hạn chót phải từ hôm nay trở đi!");
                      } else {
                        setDeadlineError("");
                      }
                    }}
                    className={`w-full px-3 py-2 bg-white dark:bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 ${deadlineError ? "border-red-500 focus:ring-red-300" : "border-gray-200 dark:border-border focus:ring-primary/30"}`}
                  />
                  {deadlineError && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      ⚠️ {deadlineError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateBundle}
                  disabled={
                    isCreating ||
                    !newProduct.trim() ||
                    !newTarget ||
                    !newPrice ||
                    !!deadlineError
                  }
                  className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Đang tạo..." : "Tạo Bundle"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewBundle(false)}
                  className="border border-gray-200 dark:border-border px-6 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Bundle Cards */}
          {bundles.map((bundle) => {
            const pct = Math.min(
              100,
              Math.round((bundle.current_kg / bundle.target_kg) * 100),
            );
            const isExpanded = expandedBundle === bundle.id;
            const deliveredKg = bundle.pledges
              .filter((p) => p.status === "DELIVERED")
              .reduce((s, p) => s + p.quantity_kg, 0);
            const committedKg = bundle.pledges
              .filter((p) => p.status === "COMMITTED")
              .reduce((s, p) => s + p.quantity_kg, 0);
            const partialKg = bundle.pledges
              .filter((p) => p.status === "PARTIAL")
              .reduce((s, p) => s + p.quantity_kg, 0);

            return (
              <div
                key={bundle.id}
                className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden"
              >
                {/* Bundle header */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 dark:text-foreground">
                          {bundle.product_name}
                        </h3>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusBadge(bundle.status)}`}
                        >
                          {statusLabel(bundle.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-foreground-muted">
                        <span>
                          🎯 {bundle.current_kg}/{bundle.target_kg} kg
                        </span>
                        <span>💰 {formatCurrency(bundle.price_per_kg)}/kg</span>
                        <span>👥 {bundle.pledges.length} farmer</span>
                        <span>
                          📅 Deadline:{" "}
                          {new Date(bundle.deadline).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <ProgressBar
                          value={pct}
                          className={`h-full rounded-full transition-all duration-700 ${
                            pct >= 100
                              ? "bg-success"
                              : "bg-gradient-to-r from-primary to-primary-light"
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          Tổng giá trị:{" "}
                          {formatCurrency(
                            bundle.current_kg * bundle.price_per_kg,
                          )}{" "}
                          /{" "}
                          {formatCurrency(
                            bundle.target_kg * bundle.price_per_kg,
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedBundle(isExpanded ? null : bundle.id)
                          }
                          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                          {isExpanded
                            ? "Ẩn chi tiết"
                            : `Xem ${bundle.pledges.length} cam kết`}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-2 shrink-0">
                      {(bundle.status === "OPEN" || bundle.status === "FULL") &&
                        bundle.pledges.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleConfirmBundle(bundle.id)}
                            className="flex items-center gap-1.5 bg-success text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Xác nhận
                          </button>
                        )}
                      {(bundle.status === "OPEN" ||
                        bundle.status === "FULL") && (
                        <button
                          type="button"
                          onClick={() => handleCancelBundle(bundle.id)}
                          className="flex items-center gap-1.5 text-red-500 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pledge detail panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-border bg-gray-50/50 dark:bg-background-light/50">
                    {/* Summary bar */}
                    <div className="px-5 py-3 flex flex-wrap gap-4 text-xs border-b border-gray-100 dark:border-border">
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Đã giao: {deliveredKg} kg
                      </span>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                        Cam kết: {committedKg} kg
                      </span>
                      {partialKg > 0 && (
                        <span className="text-amber-700 dark:text-amber-300 font-medium">
                        Giao một phần: {partialKg} kg
                        </span>
                      )}
                      <span className="text-gray-500 font-medium">
                        Còn thiếu:{" "}
                        {Math.max(0, bundle.target_kg - bundle.current_kg)} kg
                      </span>
                    </div>

                    {/* Pledge list */}
                    <div className="divide-y divide-gray-100 dark:divide-border">
                      {bundle.pledges.map((pledge) => {
                        const ps = pledgeStatusBadge(pledge.status);
                        return (
                          <div
                            key={pledge.id}
                            className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">
                                  {pledge.farmer_name}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {pledge.farmer_phone} •{" "}
                                  {new Date(
                                    pledge.created_at,
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                              <span className="text-sm font-bold text-gray-900 dark:text-foreground whitespace-nowrap">
                                {pledge.quantity_kg} kg
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ps.class}`}
                              >
                                {ps.label}
                              </span>
                            </div>
                            {pledge.note && (
                              <p className="text-[11px] text-gray-500 dark:text-foreground-muted italic flex items-start gap-1 sm:max-w-[200px]">
                                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                {pledge.note}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {bundle.pledges.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        Chưa có farmer nào cam kết cho bundle này
                      </div>
                    )}

                    {/* Revenue distribution panel — chỉ hiện khi CONFIRMED */}
                    {bundle.status === "CONFIRMED" &&
                      bundle.pledges.some(
                        (p) => p.contribution_percent != null,
                      ) && (
                        <div className="border-t border-gray-100 dark:border-border px-5 py-4">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-foreground flex items-center gap-2 mb-3">
                            <DollarSign className="w-4 h-4 text-success" /> Phân
                            chia doanh thu
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-xs text-gray-500 dark:text-foreground-muted">
                                  <th className="pb-2">Nông dân</th>
                                  <th className="pb-2 text-right">Sản lượng</th>
                                  <th className="pb-2 text-right">
                                    % Đóng góp
                                  </th>
                                  <th className="pb-2 text-right">
                                    Doanh thu dự kiến
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50 dark:divide-border">
                                {bundle.pledges
                                  .filter((p) => p.contribution_percent != null)
                                  .map((pledge) => (
                                    <tr key={pledge.id}>
                                      <td className="py-2 font-medium text-gray-900 dark:text-foreground">
                                        {pledge.farmer_name}
                                      </td>
                                      <td className="py-2 text-right text-gray-600 dark:text-foreground-muted">
                                        {pledge.quantity_kg} kg
                                      </td>
                                      <td className="py-2 text-right font-bold text-primary">
                                        {pledge.contribution_percent?.toFixed(
                                          2,
                                        )}
                                        %
                                      </td>
                                      <td className="py-2 text-right font-bold text-success">
                                        {formatCurrency(
                                          pledge.estimated_revenue || 0,
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 border-gray-200 dark:border-border font-bold">
                                  <td className="pt-2">Tổng cộng</td>
                                  <td className="pt-2 text-right">
                                    {bundle.current_kg} kg
                                  </td>
                                  <td className="pt-2 text-right text-primary">
                                    100%
                                  </td>
                                  <td className="pt-2 text-right text-success">
                                    {formatCurrency(
                                      bundle.current_kg * bundle.price_per_kg,
                                    )}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })}

          {bundles.length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có bundle nào. Tạo bundle mới để bắt đầu gom đơn!</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Mùa vụ vùng HTX (Chỉ xem — ADMIN quản lý) ═══ */}
      {activeTab === "seasonal" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900 dark:text-foreground">
              Cấu hình mùa vụ — {user?.htx_name || "HTX"}
            </h2>
          </div>

          {/* Info banner — read-only notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Cấu hình mùa vụ được quản lý bởi Quản trị viên (Admin)
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Bạn có thể xem lịch mùa vụ theo vùng để lên kế hoạch sản xuất. Liên hệ Admin nếu cần thay đổi.
              </p>
            </div>
          </div>

          {/* Seasonal table — read-only */}
          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-background-light text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">
                      Vùng
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">
                      Trực quan
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {seasonalConfig.map((cfg) => (
                    <tr
                      key={cfg.id}
                      className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-foreground">
                        {cfg.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">
                        {cfg.province || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">
                        {MONTHS[cfg.start_month - 1]} →{" "}
                        {MONTHS[cfg.end_month - 1]}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-[2px]">
                          {Array.from({ length: 12 }, (_, i) => {
                            const m = i + 1;
                            const inSeason =
                              cfg.start_month <= cfg.end_month
                                ? m >= cfg.start_month && m <= cfg.end_month
                                : m >= cfg.start_month || m <= cfg.end_month;
                            return (
                              <div
                                key={i}
                                title={MONTHS[i]}
                                className={`w-4 h-4 rounded-sm ${inSeason ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-foreground-muted">
                        {cfg.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {seasonalConfig.length === 0 && (
              <div className="text-center py-12 text-foreground-muted">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có cấu hình mùa vụ nào.</p>
                <p className="text-xs mt-1">Admin sẽ cấu hình lịch mùa vụ cho các vùng sản xuất.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Tab: Sản phẩm ═══ */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900 dark:text-foreground">Quản lý Sản phẩm</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-white dark:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-48"
              />
              <a
                href="/dashboard/products/new"
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Thêm SP
              </a>
            </div>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <ShoppingCart className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm">Chưa có sản phẩm nào.</p>
              <a href="/dashboard/products/new" className="text-primary text-sm font-medium hover:underline">+ Thêm sản phẩm đầu tiên</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellerProducts
                .filter((p: any) => {
                  if (!productSearch.trim()) return true;
                  const q = productSearch.toLowerCase();
                  return (p.name || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
                })
                .map((p: any) => {
                  const STATUS_MAP: Record<string, { label: string; cls: string }> = {
                    IN_SEASON: { label: "Đang mùa", cls: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
                    UPCOMING: { label: "Sắp mùa", cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
                    OFF_SEASON: { label: "Hết mùa", cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
                    OUT_OF_STOCK: { label: "Hết hàng", cls: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
                    HIDDEN: { label: "Đã ẩn", cls: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
                  };
                  const statusInfo = STATUS_MAP[p.status] || STATUS_MAP.IN_SEASON;
                  const CATEGORY_MAP: Record<string, string> = { FRUIT: "Trái cây", VEGETABLE: "Rau củ", GRAIN: "Ngũ cốc", TUBER: "Củ", HERB: "Thảo mộc", OTHER: "Khác" };
                  const imgSrc = p.images?.[0] || p.image_objects?.[0]?.url || "/placeholder.jpg";
                  return (
                    <div key={p.id} className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden hover:shadow-md transition-shadow group">
                      {/* Image */}
                      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <img src={imgSrc} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.cls}`}>{statusInfo.label}</span>
                      </div>
                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-foreground truncate">{p.name}</h3>
                            <p className="text-xs text-foreground-muted">{CATEGORY_MAP[p.category] || p.category}</p>
                          </div>
                          <p className="text-sm font-bold text-primary whitespace-nowrap">{formatCurrency(p.price_per_unit)}/{p.unit?.symbol || "kg"}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-foreground-muted">
                          <span>Tồn kho: {p.available_quantity} {p.unit?.symbol || "kg"}</span>
                          {p.farming_method && (
                            <span className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full">
                              {p.farming_method === "ORGANIC" ? "Hữu cơ" : p.farming_method === "VIETGAP" ? "VietGAP" : p.farming_method === "GLOBALGAP" ? "GlobalGAP" : "Truyền thống"}
                            </span>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-border">
                          <button
                            type="button"
                            onClick={() => setEditingProductId(p.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 py-2 rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const productApi = await import("@/services/api/product");
                                const newStatus = p.status === "HIDDEN" ? "IN_SEASON" : "HIDDEN";
                                await productApi.updateProductStatus(p.id, newStatus);
                                setSellerProducts(prev => prev.map(sp => sp.id === p.id ? { ...sp, status: newStatus } : sp));
                              } catch { /* silent */ }
                            }}
                            className={`flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg transition-colors ${
                              p.status === "HIDDEN"
                                ? "text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40"
                                : "text-gray-500 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                            }`}
                            title={p.status === "HIDDEN" ? "Hiện sản phẩm" : "Ẩn sản phẩm"}
                          >
                            {p.status === "HIDDEN" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* ProductEditModal */}
          {editingProductId && (
            <ProductEditModal
              productId={editingProductId}
              hideQuantity
              onClose={() => setEditingProductId(null)}
              onSaved={async () => {
                setEditingProductId(null);
                // Refresh HTX products (shop-specific)
                if (htxShopSlug) {
                  try {
                    const shopApiRefresh = await import("@/services/api/shop");
                    const htxProducts = await shopApiRefresh.apiShopService.getProducts(htxShopSlug);
                    setSellerProducts(htxProducts || []);
                  } catch { /* silent */ }
                }
              }}
            />
          )}
        </div>
      )}

      {/* ═══ Tab: Đơn hàng ═══ */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="font-bold text-gray-900 dark:text-foreground">Đơn hàng Gian hàng HTX</h2>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "Tất cả" },
                { key: "PENDING", label: "Chờ xác nhận" },
                { key: "CONFIRMED", label: "Đã xác nhận" },
                { key: "PREPARING", label: "Đang chuẩn bị" },
                { key: "SHIPPED", label: "Đang giao" },
                { key: "DELIVERED", label: "Đã giao" },
                { key: "CANCELLED", label: "Đã hủy" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={async () => {
                    setOrderStatusFilter(f.key);
                    if (htxShopId) {
                      setOrdersLoading(true);
                      try {
                        const orderApi = await import("@/services/api/order");
                        const ordersData: any = await orderApi.getShopSubOrders(htxShopId, {
                          status: f.key === "all" ? undefined : f.key,
                          size: 50,
                        });
                        const orderList = ordersData?.content || (Array.isArray(ordersData) ? ordersData : []);
                        setHtxOrders(orderList);
                      } catch {
                        setHtxOrders([]);
                      } finally {
                        setOrdersLoading(false);
                      }
                    }
                  }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    orderStatusFilter === f.key
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-surface text-gray-600 dark:text-foreground-muted border-border hover:border-primary/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : htxOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <ClipboardList className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm">Chưa có đơn hàng nào{orderStatusFilter !== "all" ? ` ở trạng thái này` : ""}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {htxOrders.map((order: any) => {
                const ORDER_STATUS_MAP: Record<string, { label: string; cls: string; icon: any }> = {
                  PENDING: { label: "Chờ xác nhận", cls: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
                  CONFIRMED: { label: "Đã xác nhận", cls: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Check },
                  PREPARING: { label: "Đang chuẩn bị", cls: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Package },
                  SHIPPED: { label: "Đang giao", cls: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300", icon: Truck },
                  DELIVERED: { label: "Đã giao", cls: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle2 },
                  CANCELLED: { label: "Đã hủy", cls: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: Ban },
                };
                const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.PENDING;
                const StatusIcon = statusInfo.icon;

                // Next status transition
                const NEXT_STATUS: Record<string, { label: string; status: string }> = {
                  PENDING: { label: "Xác nhận đơn", status: "CONFIRMED" },
                  CONFIRMED: { label: "Bắt đầu chuẩn bị", status: "PREPARING" },
                  PREPARING: { label: "Giao hàng", status: "SHIPPED" },
                  SHIPPED: { label: "Đã giao thành công", status: "DELIVERED" },
                };
                const nextAction = NEXT_STATUS[order.status];

                return (
                  <div key={order.id} className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
                    <div className="p-4 sm:p-5">
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-foreground-muted font-mono">#{order.order_code || order.orderCode || "—"}</span>
                        </div>
                        <span className="text-xs text-foreground-muted">
                          {order.created_at || order.createdAt
                            ? new Date(order.created_at || order.createdAt).toLocaleString("vi-VN")
                            : ""}
                        </span>
                      </div>

                      {/* Buyer info */}
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-foreground-muted mb-3">
                        <span>👤 {order.buyer_name || order.buyerName || "Khách"}</span>
                        <span>📞 {order.buyer_phone || order.buyerPhone || "—"}</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 mb-3">
                        {(order.items || []).map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-background rounded-lg px-3 py-2">
                            <span className="text-gray-900 dark:text-foreground font-medium">
                              {item.product?.name || "Sản phẩm"} × {item.quantity}
                            </span>
                            <span className="font-bold text-primary">{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer: subtotal + actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-border">
                        <p className="text-sm font-bold text-gray-900 dark:text-foreground">
                          Tổng: <span className="text-primary">{formatCurrency(order.subtotal)}</span>
                        </p>
                        <div className="flex gap-2">
                          {/* Cancel button (only for PENDING/CONFIRMED/PREPARING) */}
                          {["PENDING", "CONFIRMED", "PREPARING"].includes(order.status) && (
                            <button
                              type="button"
                              disabled={updatingOrderId === order.id}
                              onClick={async () => {
                                const reason = prompt("Lý do hủy đơn:");
                                if (!reason) return;
                                setUpdatingOrderId(order.id);
                                try {
                                  const orderApi = await import("@/services/api/order");
                                  await orderApi.apiOrderService.updateSubOrderStatus(order.id, "CANCELLED", reason);
                                  setHtxOrders((prev) => prev.map((o: any) => o.id === order.id ? { ...o, status: "CANCELLED" } : o));
                                } catch {
                                  setActionMessage({ type: "error", text: "Lỗi hủy đơn hàng" });
                                  setTimeout(() => setActionMessage(null), 3000);
                                } finally {
                                  setUpdatingOrderId(null);
                                }
                              }}
                              className="text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Hủy đơn
                            </button>
                          )}

                          {/* Next status action */}
                          {nextAction && (
                            <button
                              type="button"
                              disabled={updatingOrderId === order.id}
                              onClick={async () => {
                                setUpdatingOrderId(order.id);
                                try {
                                  const orderApi = await import("@/services/api/order");
                                  await orderApi.apiOrderService.updateSubOrderStatus(order.id, nextAction.status);
                                  setHtxOrders((prev) => prev.map((o: any) => o.id === order.id ? { ...o, status: nextAction.status } : o));
                                } catch {
                                  setActionMessage({ type: "error", text: "Lỗi cập nhật trạng thái đơn hàng" });
                                  setTimeout(() => setActionMessage(null), 3000);
                                } finally {
                                  setUpdatingOrderId(null);
                                }
                              }}
                              className="flex items-center gap-1.5 text-xs font-medium text-white bg-primary hover:opacity-90 px-4 py-1.5 rounded-lg transition-opacity disabled:opacity-50"
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              {nextAction.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Quản trị HTX ═══ */}
      {activeTab === "admin" && (
        <div className="space-y-6">
          {/* Chuyển quyền Chủ HTX */}
          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-border">
              <h2 className="text-lg font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                Chuyển quyền Chủ HTX
              </h2>
              <p className="text-sm text-gray-500 dark:text-foreground-muted mt-1">
                Chuyển quyền quản lý cho một thành viên khác. Bạn sẽ trở thành
                thành viên bình thường (HTX_MEMBER).
              </p>
            </div>
            <div className="p-6">
              {members.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-foreground-muted">
                  Chưa có thành viên nào để chuyển quyền.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Chọn người nhận quyền
                  </button>

                  {/* Transfer Modal */}
                  {showTransferModal && (
                    <div
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      onClick={() => setShowTransferModal(false)}
                    >
                      <div
                        className="bg-white dark:bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-foreground">
                          Chọn Chủ HTX mới
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-foreground-muted">
                          Chọn thành viên sẽ trở thành Chủ HTX. Quyền của bạn sẽ
                          chuyển thành thành viên.
                        </p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {members.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setSelectedNewManager(m.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                selectedNewManager === m.id
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-100 dark:border-border hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-foreground">
                                  {m.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-foreground-muted">
                                  {m.phone}
                                </p>
                              </div>
                              {selectedNewManager === m.id && (
                                <span className="ml-auto text-primary text-sm font-bold">
                                  ✓
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleTransfer}
                            disabled={!selectedNewManager || isTransferring}
                            className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isTransferring
                              ? "Đang xử lý..."
                              : "Xác nhận chuyển quyền"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowTransferModal(false);
                              setSelectedNewManager(null);
                            }}
                            className="px-5 py-2.5 border border-gray-200 dark:border-border rounded-lg text-sm font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Giải tán HTX */}
          <div className="bg-white dark:bg-surface rounded-xl border-2 border-red-200 dark:border-red-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
              <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Vùng nguy hiểm
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-foreground">
                  Giải tán HTX
                </h3>
                <p className="text-sm text-gray-500 dark:text-foreground-muted mt-1">
                  Hành động này{" "}
                  <strong className="text-red-600">không thể hoàn tác</strong>.
                  Tất cả thành viên sẽ bị chuyển về vai trò FARMER. Các yêu cầu
                  gia nhập đang chờ sẽ bị từ chối. HTX sẽ chuyển trạng thái
                  DISSOLVED.
                </p>
              </div>

              {!showDissolveConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDissolveConfirm(true)}
                  className="flex items-center gap-2 border-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Giải tán HTX
                </button>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 space-y-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    ⚠️ Để xác nhận, hãy nhập{" "}
                    <strong>&quot;GIAI TAN&quot;</strong> vào ô bên dưới:
                  </p>
                  <input
                    type="text"
                    value={dissolveText}
                    onChange={(e) => setDissolveText(e.target.value)}
                    placeholder='Nhập "GIAI TAN" để xác nhận'
                    className="w-full px-3 py-2 bg-white dark:bg-background border border-red-300 dark:border-red-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleDissolve}
                      disabled={dissolveText !== "GIAI TAN" || isDissolvingHtx}
                      className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDissolvingHtx ? "Đang xử lý..." : "Xác nhận giải tán"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDissolveConfirm(false);
                        setDissolveText("");
                      }}
                      className="px-5 py-2.5 border border-gray-200 dark:border-border rounded-lg text-sm font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Review Join Request Modal */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-[fadeIn_0.2s_ease-out]">
            <h3
              className={`text-xl font-bold mb-3 ${reviewModalData.action === "APPROVE" ? "text-success" : "text-red-500"}`}
            >
              {reviewModalData.action === "APPROVE"
                ? "Duyệt yêu cầu gia nhập"
                : "Từ chối yêu cầu gia nhập"}
            </h3>
            <p className="text-sm text-foreground-muted mb-4 leading-relaxed">
              Bạn có thể ghi chú lý do{" "}
              {reviewModalData.action === "APPROVE" ? "duyệt" : "từ chối"}{" "}
              (không bắt buộc). Nông dân sẽ xem được ghi chú này.
            </p>
            <textarea
              className="w-full border border-border rounded-xl p-3 bg-background min-h-[100px] mb-4 outline-none focus:border-primary transition-colors text-sm resize-none text-foreground"
              placeholder="VD: Cần bổ sung thêm thông tin..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
            <div className="flex gap-3 justify-end items-center">
              <button
                className="px-4 py-2 rounded-lg font-medium text-foreground-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                onClick={() => {
                  setReviewModalData(null);
                  setReviewNote("");
                }}
                disabled={isReviewing}
              >
                Hủy
              </button>
              <button
                className={`text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm ${reviewModalData.action === "APPROVE" ? "bg-success hover:opacity-90" : "bg-red-500 hover:opacity-90"}`}
                onClick={confirmReviewJoin}
                disabled={isReviewing}
              >
                {isReviewing ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * /cooperative/manage — Chỉ HTX_MANAGER mới truy cập
 * UC-07: Tạo HTX (implicit — đã tạo)
 * UC-09: Duyệt/Từ chối thành viên HTX
 * UC-29: Tạo Bundle gom đơn
 * UC-30: Farmer cam kết (pledge) vào Bundle
 * UC-34: Confirm Bundle
 * UC-36: Config mùa vụ vùng HTX
 */
export default function CoopManagePage() {
  return (
    <ProtectedRoute roles={["HTX_MANAGER"]}>
      <CoopManageContent />
    </ProtectedRoute>
  );
}
