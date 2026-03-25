package com.capnong.model;

import com.capnong.model.enums.HtxStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "htx")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Htx {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "official_code", nullable = false, unique = true, length = 12)
    private String officialCode;

    @Column(nullable = false, length = 100)
    private String province;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "document_url", columnDefinition = "TEXT")
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private HtxStatus status = HtxStatus.PENDING;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
