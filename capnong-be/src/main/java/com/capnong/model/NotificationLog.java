package com.capnong.model;

import com.capnong.model.enums.NotificationChannel;
import com.capnong.model.enums.NotificationQueueStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "notification_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class NotificationLog extends BaseEntity {

    @Column(name = "queue_id", nullable = false)
    private UUID queueId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationQueueStatus status; // Usually SENT or FAILED

    @Column(nullable = false)
    @Builder.Default
    private Integer attempt = 1;
}
