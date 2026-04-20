package com.capnong.repository;

import com.capnong.model.Product;
import com.capnong.model.enums.ProductStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    List<Product> findByShopSlugAndStatusNot(String shopSlug, ProductStatus status);

    List<Product> findByStatusNot(ProductStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") UUID id);

    List<Product> findByShopId(UUID shopId);

    @Query("SELECT p FROM Product p WHERE p.status != 'HIDDEN' AND p.status != 'REJECTED' AND p.availableQuantity > 0")
    List<Product> findAllActive();

    Page<Product> findByShop_Owner_Username(String username, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.shop.owner.username = :username AND p.status != 'HIDDEN'")
    long countActiveByShopOwnerUsername(@Param("username") String username);
}