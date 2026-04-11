package com.capnong.scheduler;

import com.capnong.service.SeasonalConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Cron Job chạy hàng ngày lúc 00:00 UTC+7 để cập nhật ProductStatus
 * dựa trên SeasonalConfig.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SeasonalStatusJob {

    private final SeasonalConfigService seasonalConfigService;

    @Scheduled(cron = "0 0 0 * * ?", zone = "Asia/Ho_Chi_Minh")
    public void updateProductStatuses() {
        log.info("===== Seasonal Status Update Job started =====");
        try {
            seasonalConfigService.runSeasonalStatusUpdate();
        } catch (Exception e) {
            log.error("Seasonal status update failed: {}", e.getMessage(), e);
        }
        log.info("===== Seasonal Status Update Job finished =====");
    }
}
