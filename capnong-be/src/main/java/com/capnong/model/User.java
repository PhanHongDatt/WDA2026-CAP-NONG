package com.capnong.model;

import com.capnong.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "phone")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
@SQLRestriction("deleted = false")
public class User extends BaseEntity {

    @Column(unique = true, length = 50)
    private String username;

    @Column(unique = true, length = 100)
    private String email;

    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(unique = true, length = 15)
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "username_updated_at")
    private LocalDateTime usernameUpdatedAt;

    /** HTX hiện tại mà user đang là thành viên (null nếu không thuộc HTX nào) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "htx_id")
    private Htx htx;
}
