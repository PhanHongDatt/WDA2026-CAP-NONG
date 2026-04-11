package com.capnong.model;

import com.capnong.model.enums.PledgeStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bundle_pledges",
       uniqueConstraints = @UniqueConstraint(columnNames = {"bundle_id", "farmer_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BundlePledge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /* ─── Relationships ─── */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bundle_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "pledges"})
    private CooperativeBundle bundle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User farmer;

    /* ─── Pledge Data ─── */

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Column(name = "contribution_percent", precision = 6, scale = 4)
    private BigDecimal contributionPercent;

    @Column(name = "estimated_revenue", precision = 15, scale = 2)
    private BigDecimal estimatedRevenue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PledgeStatus status = PledgeStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
