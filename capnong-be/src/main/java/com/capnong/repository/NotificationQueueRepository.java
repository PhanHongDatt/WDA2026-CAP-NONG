package com.capnong.repository;

import com.capnong.model.NotificationQueue;
import com.capnong.model.enums.NotificationQueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationQueueRepository extends JpaRepository<NotificationQueue, UUID> {

    @Query("SELECT n FROM NotificationQueue n WHERE n.status = :status AND (n.scheduledAt IS NULL OR n.scheduledAt <= :now)")
    List<NotificationQueue> findPendingNotificationsDue(@Param("status") NotificationQueueStatus status, @Param("now") LocalDateTime now);

    List<NotificationQueue> findByUserIdAndStatus(UUID userId, NotificationQueueStatus status);
}
