package com.capnong.service.impl;

import com.capnong.model.*;
import com.capnong.model.enums.CancelledBy;
import com.capnong.model.enums.NotificationType;
import com.capnong.repository.ShopRepository;
import com.capnong.service.OrderEventNotifier;
import com.capnong.service.TelegramNotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderEventNotifierImpl implements OrderEventNotifier {

    private static final Logger logger = LoggerFactory.getLogger(OrderEventNotifierImpl.class);

    private final TelegramNotificationService telegramNotificationService;
    private final ShopRepository shopRepository;
    private final com.capnong.service.SmartNotificationService smartNotificationService;

    @Override
    public void notifyNewOrder(Order order, Collection<SubOrder> subOrders) {
        for (SubOrder subOrder : subOrders) {
            try {
                Shop shop = subOrder.getShop();
                if (shop != null && shop.getOwner() != null) {
                    UUID farmerId = shop.getOwner().getId();
                    String title = "🛒 Đơn hàng mới #" + order.getOrderNumber();
                    String body = "Bạn có đơn hàng mới với " + subOrder.getItems().size()
                            + " sản phẩm. Tổng: " + subOrder.getSubtotal() + "₫";
                    telegramNotificationService.notify(farmerId, NotificationType.NEW_ORDER, title, body);
                    
                    // Trigger Smart Notification (SMS/Voice Call)
                    Double totalAmount = subOrder.getSubtotal() != null ? subOrder.getSubtotal().doubleValue() : 0.0;
                    smartNotificationService.processNewOrderEvent(subOrder.getId(), farmerId, totalAmount);
                }
            } catch (Exception e) {
                logger.warn("Failed to notify farmer for sub-order {}: {}", subOrder.getId(), e.getMessage());
            }
        }
    }

    @Override
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

    @Override
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

    @Override
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
