package com.capnong.service;

import com.capnong.model.Order;
import com.capnong.model.Product;
import com.capnong.model.Review;
import com.capnong.model.SubOrder;
import com.capnong.model.enums.CancelledBy;

import java.util.Collection;

public interface OrderEventNotifier {
    void notifyNewOrder(Order order, Collection<SubOrder> subOrders);
    void notifyStatusChange(SubOrder subOrder, Order order);
    void notifyCancellation(SubOrder subOrder, Order order, CancelledBy cancelledBy);
    void notifyNewReview(Review review, Product product);
}
