package com.capnong.scheduler;

import com.capnong.model.NotificationLog;
import com.capnong.model.NotificationQueue;
import com.capnong.model.User;
import com.capnong.model.enums.NotificationChannel;
import com.capnong.model.enums.NotificationQueueStatus;
import com.capnong.repository.NotificationLogRepository;
import com.capnong.repository.NotificationQueueRepository;
import com.capnong.repository.UserRepository;
import com.capnong.service.impl.TwilioGatewayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SmartNotificationScheduler {

    private final NotificationQueueRepository notificationQueueRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final UserRepository userRepository;
    private final TwilioGatewayService twilioGatewayService;

    @Scheduled(fixedDelay = 60000) // Run every 1 minute
    @Transactional
    public void processPendingNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<NotificationQueue> pendingItems = notificationQueueRepository.findPendingNotificationsDue(NotificationQueueStatus.PENDING, now);

        if (pendingItems.isEmpty()) {
            return;
        }

        log.info("Found {} pending notification(s) to process", pendingItems.size());

        for (NotificationQueue queue : pendingItems) {
            try {
                User user = userRepository.findById(queue.getUserId()).orElse(null);
                if (user == null || user.getPhone() == null || user.getPhone().isEmpty()) {
                    log.warn("User {} not found or has no phone number. Marking as FAILED.", queue.getUserId());
                    queue.setStatus(NotificationQueueStatus.FAILED);
                    notificationQueueRepository.save(queue);
                    continue;
                }

                String phoneNumber = user.getPhone();
                int orderCount = queue.getOrderIds().size();
                String gatewayResponse = "";

                if (queue.getChannel() == NotificationChannel.SMS) {
                    // Send SMS
                    String content = String.format("[Cạp Nông] Bạn có %d đơn hàng mới đang chờ xác nhận. Vui lòng kiểm tra ứng dụng.", orderCount);
                    gatewayResponse = twilioGatewayService.sendSms(phoneNumber, content);
                } else if (queue.getChannel() == NotificationChannel.CALL) {
                    // Voice Call
                    String textToSpeech = String.format("Xin chào. Bạn có %d đơn hàng mới trên hệ thống Cạp Nông. Vui lòng mở ứng dụng để kiểm tra và xác nhận. Xin cảm ơn.", orderCount);
                    gatewayResponse = twilioGatewayService.makeVoiceCall(phoneNumber, textToSpeech);
                }

                // Update queue status
                queue.setStatus(NotificationQueueStatus.SENT);
                queue.setSentAt(LocalDateTime.now());
                notificationQueueRepository.save(queue);

                // Save Log
                NotificationLog logEntry = NotificationLog.builder()
                        .queueId(queue.getId())
                        .channel(queue.getChannel())
                        .phoneNumber(phoneNumber)
                        .content("Order count: " + orderCount)
                        .gatewayResponse(gatewayResponse)
                        .status(NotificationQueueStatus.SENT)
                        .attempt(1)
                        .build();
                notificationLogRepository.save(logEntry);

            } catch (Exception e) {
                log.error("Failed to process notification queue {}: {}", queue.getId(), e.getMessage());
                // Escalation / Retry Logic (Fallback to Call if SMS fails)
                if (queue.getChannel() == NotificationChannel.SMS) {
                    log.info("Fallback to VOICE CALL for queue {}", queue.getId());
                    queue.setChannel(NotificationChannel.CALL);
                    queue.setScheduledAt(LocalDateTime.now().plusMinutes(5)); // Retry call in 5 mins
                    notificationQueueRepository.save(queue);
                } else {
                    queue.setStatus(NotificationQueueStatus.FAILED);
                    notificationQueueRepository.save(queue);
                }

                NotificationLog logEntry = NotificationLog.builder()
                        .queueId(queue.getId())
                        .channel(queue.getChannel())
                        .phoneNumber("UNKNOWN")
                        .content("Error: " + e.getMessage())
                        .status(NotificationQueueStatus.FAILED)
                        .attempt(1)
                        .build();
                notificationLogRepository.save(logEntry);
            }
        }
    }
}
