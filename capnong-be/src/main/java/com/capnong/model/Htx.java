package com.capnong.model;

import com.capnong.model.enums.HtxStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "htx")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@SQLRestriction("deleted = false")
public class Htx extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "official_code", nullable = false, unique = true, length = 12)
    private String officialCode;

    @Column(nullable = false, length = 100)
    private String province;

    @Column(nullable = false, length = 100)
    private String ward;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "document_url", columnDefinition = "TEXT")
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private HtxStatus status = HtxStatus.PENDING;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    /** User đã gửi đơn tạo HTX (creator, trước khi được duyệt) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;
}
