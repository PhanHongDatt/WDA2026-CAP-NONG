package com.capnong.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "shops")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@SQLRestriction("deleted = false")
public class Shop extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private User owner;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String province;

    @Column(nullable = false)
    private String district;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Integer yearsExperience;
    private Integer farmAreaM2;
    private String avatarUrl;
}