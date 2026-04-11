package com.capnong.scheduler;

import com.capnong.service.CooperativeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler tự động expire bundles quá deadline.
 * Chạy mỗi ngày lúc 00:00 UTC+7 (= 17:00 UTC ngày trước).
 */
@Component
public class BundleScheduler {

    private static final Logger logger = LoggerFactory.getLogger(BundleScheduler.class);

    private final CooperativeService cooperativeService;

    public BundleScheduler(CooperativeService cooperativeService) {
        this.cooperativeService = cooperativeService;
    }

    @Scheduled(cron = "${app.scheduler.bundle-expire:0 0 0 * * *}", zone = "Asia/Ho_Chi_Minh")
    public void expireBundles() {
        logger.info("⏰ Bundle expiration scheduler started");
        try {
            int count = cooperativeService.expireOpenBundles();
            logger.info("⏰ Bundle expiration completed: {} bundles expired", count);
        } catch (Exception e) {
            logger.error("❌ Bundle expiration scheduler failed", e);
        }
    }
}
