package com.capnong.model;

import com.capnong.model.enums.UnitCategory;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "units")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@SQLRestriction("deleted = false")
public class Unit extends BaseEntity {

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(nullable = false, length = 50)
    private String displayName;

    @Column(nullable = false, length = 10)
    private String symbol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_unit_id")
    private Unit baseUnit;

    @Column(nullable = false, precision = 12, scale = 6)
    @Builder.Default
    private BigDecimal conversionFactor = BigDecimal.ONE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UnitCategory category;

    @ElementCollection
    @CollectionTable(name = "unit_aliases", joinColumns = @JoinColumn(name = "unit_id"))
    @Column(name = "alias")
    private List<String> aliases;
}
