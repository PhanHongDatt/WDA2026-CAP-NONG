package com.capnong.service.impl;

import com.capnong.model.NotificationQueue;
import com.capnong.model.enums.NotificationChannel;
import com.capnong.model.enums.NotificationPriority;
import com.capnong.model.enums.NotificationQueueStatus;
import com.capnong.repository.NotificationQueueRepository;
import com.capnong.service.SmartNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartNotificationServiceImpl implements SmartNotificationService {

    private final NotificationQueueRepository notificationQueueRepository;

    @Override
    public void processNewOrderEvent(UUID orderId, UUID sellerId, Double totalAmount) {
        log.info("Processing new order event for seller: {}, orderId: {}", sellerId, orderId);

        NotificationPriority priority = NotificationPriority.LOW;
        if (totalAmount != null && totalAmount > 1000000) { // e.g. > 1 million VND
            priority = NotificationPriority.HIGH;
        }

        // Logic batching: check if there is an existing PENDING queue for this seller
        List<NotificationQueue> pendingQueues = notificationQueueRepository.findByUserIdAndStatus(sellerId, NotificationQueueStatus.PENDING);
        
        if (!pendingQueues.isEmpty()) {
            NotificationQueue queue = pendingQueues.get(0);
            if (queue.getOrderIds() == null) {
                queue.setOrderIds(new ArrayList<>());
            }
            if (!queue.getOrderIds().contains(orderId)) {
                queue.getOrderIds().add(orderId);
            }
            
            if (priority == NotificationPriority.HIGH) {
                queue.setPriority(NotificationPriority.HIGH); // Upgrade priority
                queue.setScheduledAt(LocalDateTime.now()); // Send immediately
            }
            notificationQueueRepository.save(queue);
            log.info("Batched order {} to existing queue {}", orderId, queue.getId());
        } else {
            List<UUID> orderIds = new ArrayList<>();
            orderIds.add(orderId);
            
            LocalDateTime scheduledAt = (priority == NotificationPriority.HIGH) 
                    ? LocalDateTime.now() 
                    : LocalDateTime.now().plusMinutes(10); // Batch window of 10 mins for LOW

            NotificationQueue newQueue = NotificationQueue.builder()
                    .userId(sellerId)
                    .orderIds(orderIds)
                    .channel(NotificationChannel.SMS) // Default layer 1
                    .priority(priority)
                    .status(NotificationQueueStatus.PENDING)
                    .scheduledAt(scheduledAt)
                    .build();
            
            notificationQueueRepository.save(newQueue);
            log.info("Created new notification queue {} for seller {}", newQueue.getId(), sellerId);
        }
    }
}
