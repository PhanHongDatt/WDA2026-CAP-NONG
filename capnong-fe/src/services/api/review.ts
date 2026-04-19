/**
 * API Review Service — Khớp BE ReviewController
 *
 * BE Endpoints (prefix /api/reviews):
 *   GET  /product/{productId}     → Danh sách đánh giá SP (pageable)
 *   POST /                        → Tạo đánh giá (BUYER)
 *   POST /{id}/reply              → Phản hồi đánh giá (FARMER/HTX)
 */
import api from "../api";

export interface ReviewData {
  id?: string;
  productId: string;
  orderItemId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface ReviewResponse {
  id: string;
  authorId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  comment?: string;
  images?: string[];
  sellerReply?: string;
  createdAt: string;
}

/**
 * Lấy danh sách review của sản phẩm (phân trang)
 */
export async function getProductReviews(
  productId: string,
  page: number = 0,
  size: number = 10
): Promise<{ content: ReviewResponse[]; totalElements: number; totalPages: number }> {
  const res = await api.get(`/api/reviews/product/${productId}`, {
    params: { page, size },
  });
  const data = res.data.data || res.data;
  return {
    content: data.content || [],
    totalElements: data.totalElements || 0,
    totalPages: data.totalPages || 0,
  };
}

/**
 * Tạo đánh giá sản phẩm (BUYER only)
 */
export async function createReview(review: ReviewData): Promise<ReviewResponse> {
  const res = await api.post("/api/reviews", review);
  return res.data.data || res.data;
}

/**
 * Phản hồi đánh giá (FARMER/HTX_MEMBER/HTX_MANAGER)
 */
export async function replyToReview(reviewId: string, reply: string): Promise<ReviewResponse> {
  const res = await api.post(`/api/reviews/${reviewId}/reply`, { reply });
  return res.data.data || res.data;
}
