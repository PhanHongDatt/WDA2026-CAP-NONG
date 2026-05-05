package com.capnong.service;

import java.util.UUID;

public interface SmartNotificationService {
    void processNewOrderEvent(UUID orderId, UUID sellerId, Double totalAmount);
}
