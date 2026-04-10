package com.capnong.model;

import com.capnong.model.enums.JoinRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "htx_join_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
public class HtxJoinRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "htx_id", nullable = false)
    private Htx htx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private JoinRequestStatus status = JoinRequestStatus.PENDING;

    /** Ghi chú từ HTX_MANAGER khi duyệt/từ chối */
    @Column(columnDefinition = "TEXT")
    private String note;
}
