package com.capnong.service;

import com.capnong.model.*;
import com.capnong.model.enums.CancelledBy;
import com.capnong.model.enums.NotificationType;
import com.capnong.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service chịu trách nhiệm gửi thông báo cho các sự kiện đơn hàng và review.
 * Dùng TelegramNotificationService (in-app + Telegram nếu đã link).
 */
@Service
@RequiredArgsConstructor
public class OrderEventNotifier {

    private static final Logger logger = LoggerFactory.getLogger(OrderEventNotifier.class);

    private final TelegramNotificationService telegramNotificationService;
    private final ShopRepository shopRepository;

    /**
     * Thông báo có đơn hàng mới cho tất cả farmer (chủ shop) liên quan.
     */
    public void notifyNewOrder(Order order, java.util.Collection<SubOrder> subOrders) {
        for (SubOrder subOrder : subOrders) {
            try {
                Shop shop = subOrder.getShop();
                if (shop != null && shop.getOwner() != null) {
                    UUID farmerId = shop.getOwner().getId();
                    String title = "🛒 Đơn hàng mới #" + order.getOrderNumber();
                    String body = "Bạn có đơn hàng mới với " + subOrder.getItems().size()
                            + " sản phẩm. Tổng: " + subOrder.getSubtotal() + "₫";
                    telegramNotificationService.notify(farmerId, NotificationType.NEW_ORDER, title, body);
                }
            } catch (Exception e) {
                logger.warn("Failed to notify farmer for sub-order {}: {}", subOrder.getId(), e.getMessage());
            }
        }
    }

    /**
     * Thông báo trạng thái đơn thay đổi cho buyer.
     */
    public void notifyStatusChange(SubOrder subOrder, Order order) {
        try {
            if (order.getUser() != null) {
                UUID buyerId = order.getUser().getId();
                String shopName = subOrder.getShop() != null ? subOrder.getShop().getName() : "Shop";
                String title = "📦 Cập nhật đơn hàng #" + order.getOrderNumber();
                String body = "Đơn từ " + shopName + " đã chuyển sang trạng thái: " + subOrder.getStatus().name();
                telegramNotificationService.notify(buyerId, NotificationType.ORDER_STATUS_UPDATE, title, body);
            }
        } catch (Exception e) {
            logger.warn("Failed to notify buyer for status change: {}", e.getMessage());
        }
    }

    /**
     * Thông báo đơn bị hủy cho các bên liên quan.
     */
    public void notifyCancellation(SubOrder subOrder, Order order, CancelledBy cancelledBy) {
        try {
            String reason = subOrder.getCancelReason() != null ? subOrder.getCancelReason() : "Không có lý do";
            String shopName = subOrder.getShop() != null ? subOrder.getShop().getName() : "Shop";

            if (cancelledBy == CancelledBy.SELLER || cancelledBy == CancelledBy.SYSTEM) {
                // Notify buyer
                if (order.getUser() != null) {
                    String title = "❌ Đơn hàng bị hủy #" + order.getOrderNumber();
                    String body = "Đơn từ " + shopName + " đã bị hủy. Lý do: " + reason;
                    telegramNotificationService.notify(order.getUser().getId(),
                            NotificationType.ORDER_CANCELLED, title, body);
                }
            }

            if (cancelledBy == CancelledBy.BUYER) {
                // Notify farmer
                if (subOrder.getShop() != null && subOrder.getShop().getOwner() != null) {
                    String title = "❌ Buyer hủy đơn #" + order.getOrderNumber();
                    String body = "Người mua đã hủy đơn hàng.";
                    telegramNotificationService.notify(subOrder.getShop().getOwner().getId(),
                            NotificationType.ORDER_CANCELLED, title, body);
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to send cancellation notification: {}", e.getMessage());
        }
    }

    /**
     * Thông báo review mới cho farmer chủ sản phẩm.
     */
    public void notifyNewReview(Review review, Product product) {
        try {
            if (product.getShop() != null && product.getShop().getOwner() != null) {
                UUID farmerId = product.getShop().getOwner().getId();
                String title = "⭐ Đánh giá mới cho " + product.getName();
                String body = review.getRating() + " sao: \"" + review.getComment() + "\"";
                telegramNotificationService.notify(farmerId, NotificationType.REVIEW_NEW, title, body);
            }
        } catch (Exception e) {
            logger.warn("Failed to send review notification: {}", e.getMessage());
        }
    }
}
