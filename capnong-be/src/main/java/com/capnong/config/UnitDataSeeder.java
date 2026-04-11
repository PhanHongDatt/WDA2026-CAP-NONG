package com.capnong.config;

import com.capnong.model.Unit;
import com.capnong.model.enums.UnitCategory;
import com.capnong.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seed data cho bảng Units khi khởi động ứng dụng.
 * Chỉ insert nếu chưa tồn tại (idempotent).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class UnitDataSeeder implements CommandLineRunner {

    private final UnitRepository unitRepository;

    @Override
    public void run(String... args) {
        if (unitRepository.count() > 0) {
            log.info("Units already seeded, skipping...");
            return;
        }

        log.info("Seeding unit data...");

        // Base weight unit: KG
        Unit kg = saveUnit("KG", "Kilogram", "kg", null, BigDecimal.ONE, UnitCategory.WEIGHT,
                List.of("ký", "kí", "kg", "kilô"));

        // Weight units derived from KG
        saveUnit("TON", "Tấn", "tấn", kg, new BigDecimal("1000"), UnitCategory.WEIGHT,
                List.of("tấn"));

        saveUnit("TA", "Tạ", "tạ", kg, new BigDecimal("100"), UnitCategory.WEIGHT,
                List.of("tạ"));

        saveUnit("YEN", "Yến", "yến", kg, new BigDecimal("10"), UnitCategory.WEIGHT,
                List.of("yến"));

        saveUnit("GRAM", "Gram", "g", kg, new BigDecimal("0.001"), UnitCategory.WEIGHT,
                List.of("gram", "gam", "g"));

        // Count units
        saveUnit("PIECE", "Trái/Quả", "trái", null, BigDecimal.ONE, UnitCategory.COUNT,
                List.of("trái", "quả", "củ", "cái"));

        saveUnit("BUNCH", "Bó/Chùm", "bó", null, BigDecimal.ONE, UnitCategory.COUNT,
                List.of("bó", "chùm", "nải"));

        // Packaging units
        saveUnit("BOX", "Thùng/Hộp", "thùng", null, BigDecimal.ONE, UnitCategory.PACKAGING,
                List.of("thùng", "hộp", "sọt"));

        saveUnit("BAG", "Bao/Túi", "bao", null, BigDecimal.ONE, UnitCategory.PACKAGING,
                List.of("bao", "túi", "bịch"));

        log.info("Unit data seeded successfully! ({} units)", unitRepository.count());
    }

    private Unit saveUnit(String code, String displayName, String symbol,
                          Unit baseUnit, BigDecimal conversionFactor,
                          UnitCategory category, List<String> aliases) {
        Unit unit = Unit.builder()
                .code(code)
                .displayName(displayName)
                .symbol(symbol)
                .baseUnit(baseUnit)
                .conversionFactor(conversionFactor)
                .category(category)
                .aliases(aliases)
                .build();
        return unitRepository.save(unit);
    }
}
