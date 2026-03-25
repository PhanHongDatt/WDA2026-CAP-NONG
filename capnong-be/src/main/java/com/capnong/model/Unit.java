package com.capnong.model;

import com.capnong.model.enums.UnitCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "units")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Unit {

    @Id
    @Column(length = 10)
    private String code;

    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    @Column(nullable = false, length = 10)
    private String symbol;

    @Column(name = "base_unit", length = 10)
    private String baseUnit;

    @Column(name = "conversion_factor", nullable = false, precision = 12, scale = 6)
    @Builder.Default
    private java.math.BigDecimal conversionFactor = java.math.BigDecimal.ONE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UnitCategory category;

    @Column(columnDefinition = "TEXT[]")
    private String aliases;
}
