"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Send, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewItem {
  id: string;
  product_id: string;
  order_item_id?: string;
  author_id: string;
  rating: number;
  comment: string;
  images?: string;
  seller_reply?: string;
  created_at: string;
}

const RATING_FILTERS = [
  { value: 0, label: "Tất cả" },
  { value: 5, label: "5 ⭐" },
  { value: 4, label: "4 ⭐" },
  { value: 3, label: "3 ⭐" },
  { value: 2, label: "2 ⭐" },
  { value: 1, label: "1 ⭐" },
];

const REPLY_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "replied", label: "Đã trả lời" },
  { value: "unreplied", label: "Chưa trả lời" },
];

function SellerReviewsPage() {
  const { isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [ratingFilter, setRatingFilter] = useState(0);
  const [replyFilter, setReplyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Reply state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Expand/collapse
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const { getSellerReviews } = await import("@/services/api/review");
      const res = await getSellerReviews(page, 20);
      setReviews(res.content as unknown as ReviewItem[]);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (e) {
      console.error("Failed to fetch seller reviews:", e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim() || replyText.length < 5) return;
    setSubmittingReply(true);
    try {
      const { replyToReview } = await import("@/services/api/review");
      await replyToReview(reviewId, replyText.trim());
      // Update local state
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, seller_reply: replyText.trim() } : r
      ));
      setReplyingId(null);
      setReplyText("");
    } catch (e) {
      console.error(e);
      alert("Lỗi khi gửi phản hồi. Vui lòng thử lại!");
    } finally {
      setSubmittingReply(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Client-side filtering
  const filteredReviews = reviews.filter(r => {
    if (ratingFilter > 0 && r.rating !== ratingFilter) return false;
    if (replyFilter === "replied" && !r.seller_reply) return false;
    if (replyFilter === "unreplied" && r.seller_reply) return false;
    if (searchQuery && !r.comment?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Stats
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const repliedCount = reviews.filter(r => r.seller_reply).length;
  const unrepliedCount = reviews.filter(r => !r.seller_reply).length;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Đánh giá từ khách hàng</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Quản lý và phản hồi các đánh giá về sản phẩm của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">{totalElements}</div>
          <div className="text-xs text-foreground-muted mt-1">Tổng đánh giá</div>
        </div>
        <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-bold text-yellow-500">{avgRating}</span>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="text-xs text-foreground-muted mt-1">Sao trung bình</div>
        </div>
        <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{repliedCount}</div>
          <div className="text-xs text-foreground-muted mt-1">Đã phản hồi</div>
        </div>
        <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-accent">{unrepliedCount}</div>
          <div className="text-xs text-foreground-muted mt-1">Chờ phản hồi</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-surface border border-border rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nội dung đánh giá..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground-muted shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {RATING_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setRatingFilter(f.value)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    ratingFilter === f.value
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-surface-hover text-foreground-muted hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reply filter */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {REPLY_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setReplyFilter(f.value)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  replyFilter === f.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-surface-hover text-foreground-muted hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-surface border border-border rounded-2xl p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-foreground-muted mt-3">Đang tải đánh giá...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-surface border border-border rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-foreground-muted">
              {reviews.length === 0 ? "Chưa có đánh giá nào" : "Không có đánh giá phù hợp bộ lọc"}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-surface border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* Review Header */}
              <div
                className="flex items-start gap-3 p-4 cursor-pointer"
                onClick={() => toggleExpand(review.id)}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {review.author_id?.slice(0, 2).toUpperCase() || "KH"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      Khách hàng
                    </span>
                    <span className="text-[11px] text-foreground-muted">
                      {formatDate(review.created_at)}
                    </span>
                    {!review.seller_reply && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                        Chờ phản hồi
                      </span>
                    )}
                    {review.seller_reply && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        Đã phản hồi
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment preview */}
                  <p className={`text-sm text-foreground mt-1.5 ${
                    expandedIds.has(review.id) ? "" : "line-clamp-2"
                  }`}>
                    {review.comment}
                  </p>
                </div>

                <button className="shrink-0 p-1 text-foreground-muted">
                  {expandedIds.has(review.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Expanded Content */}
              {expandedIds.has(review.id) && (
                <div className="px-4 pb-4 pt-0 space-y-3">
                  {/* Seller Reply */}
                  {review.seller_reply ? (
                    <div className="ml-12 p-3 bg-primary/5 border-l-2 border-primary rounded-lg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-primary">Phản hồi của bạn</span>
                      </div>
                      <p className="text-sm text-foreground-muted">{review.seller_reply}</p>
                    </div>
                  ) : replyingId === review.id ? (
                    <div className="ml-12 space-y-2">
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Viết phản hồi cho khách hàng..."
                          className="w-full px-4 py-3 pr-12 text-sm bg-gray-50 dark:bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
                          autoFocus
                        />
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={replyText.length < 5 || submittingReply}
                          className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 hover:bg-primary-dark transition-all"
                          title="Gửi phản hồi"
                        >
                          {submittingReply ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-foreground-muted">
                          Tối thiểu 5 ký tự ({replyText.length}/5)
                        </p>
                        <button
                          onClick={() => { setReplyingId(null); setReplyText(""); }}
                          className="text-xs text-foreground-muted hover:text-foreground hover:underline"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-12">
                      <button
                        onClick={() => { setReplyingId(review.id); setReplyText(""); }}
                        className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Viết phản hồi
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm rounded-xl border border-border bg-white dark:bg-surface disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Trang trước
          </button>
          <span className="text-sm text-foreground-muted px-3">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm rounded-xl border border-border bg-white dark:bg-surface disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardReviewsPage() {
  return (
    <ProtectedRoute roles={["FARMER", "HTX_MEMBER", "HTX_MANAGER"]}>
      <SellerReviewsPage />
    </ProtectedRoute>
  );
}
