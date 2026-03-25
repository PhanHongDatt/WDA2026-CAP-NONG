package com.capnong.repository;

import com.capnong.model.Product;
import com.capnong.model.enums.ProductCategory;
import com.capnong.model.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByShopId(UUID shopId);

    Page<Product> findByCategory(ProductCategory category, Pageable pageable);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    @Query(value = "SELECT * FROM products p WHERE " +
           "(CAST(:category AS VARCHAR) IS NULL OR p.category = CAST(:category AS VARCHAR)) AND " +
           "(CAST(:status AS VARCHAR) IS NULL OR p.status = CAST(:status AS VARCHAR)) AND " +
           "(CAST(:minPrice AS NUMERIC) IS NULL OR p.price_per_unit >= CAST(:minPrice AS NUMERIC)) AND " +
           "(CAST(:maxPrice AS NUMERIC) IS NULL OR p.price_per_unit <= CAST(:maxPrice AS NUMERIC)) AND " +
           "(CAST(:keyword AS VARCHAR) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS VARCHAR), '%')))",
           countQuery = "SELECT COUNT(*) FROM products p WHERE " +
           "(CAST(:category AS VARCHAR) IS NULL OR p.category = CAST(:category AS VARCHAR)) AND " +
           "(CAST(:status AS VARCHAR) IS NULL OR p.status = CAST(:status AS VARCHAR)) AND " +
           "(CAST(:minPrice AS NUMERIC) IS NULL OR p.price_per_unit >= CAST(:minPrice AS NUMERIC)) AND " +
           "(CAST(:maxPrice AS NUMERIC) IS NULL OR p.price_per_unit <= CAST(:maxPrice AS NUMERIC)) AND " +
           "(CAST(:keyword AS VARCHAR) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS VARCHAR), '%')))",
           nativeQuery = true)
    Page<Product> searchProducts(
            @Param("category") String category,
            @Param("status") String status,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.shopId = :shopId AND p.status <> 'HIDDEN'")
    List<Product> findVisibleByShopId(@Param("shopId") UUID shopId);
}
