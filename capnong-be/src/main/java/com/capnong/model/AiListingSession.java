package com.capnong.model;

import com.capnong.model.enums.AiSessionStatus;
import com.capnong.model.enums.AiSessionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_listing_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@SQLRestriction("deleted = false")
public class AiListingSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AiSessionType sessionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AiSessionStatus status = AiSessionStatus.IN_PROGRESS;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private LocalDateTime completedAt;

    /** JSON kết quả AI (caption/poster) — lưu toàn bộ response */
    @Column(columnDefinition = "TEXT")
    private String resultJson;

    /** Thông báo lỗi nếu xử lý thất bại */
    @Column(length = 500)
    private String errorMessage;
}
