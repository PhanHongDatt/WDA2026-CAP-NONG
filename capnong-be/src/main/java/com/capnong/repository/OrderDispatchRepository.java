package com.capnong.repository;

import com.capnong.model.OrderDispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderDispatchRepository extends JpaRepository<OrderDispatch, UUID> {
    List<OrderDispatch> findByOrderItem_SubOrder_Id(UUID subOrderId);
    List<OrderDispatch> findByFarmer_Id(UUID farmerId);

    @Query("SELECT COALESCE(SUM(d.dispatchedQuantity), 0) FROM OrderDispatch d WHERE d.pledge.id = :pledgeId")
    BigDecimal sumDispatchedByPledgeId(@Param("pledgeId") UUID pledgeId);
}
