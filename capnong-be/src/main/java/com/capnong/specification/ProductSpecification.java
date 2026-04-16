package com.capnong.specification;

import com.capnong.dto.request.ProductFilterParams;
import com.capnong.model.Product;
import com.capnong.model.Shop;
import com.capnong.model.enums.FarmingMethod;
import com.capnong.model.enums.ProductCategory;
import com.capnong.model.enums.ProductStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic Specification builder cho Product search.
 * Compose tất cả filter params thành 1 Specification<Product>.
 */
public class ProductSpecification {

    private ProductSpecification() {}

    public static Specification<Product> fromFilter(ProductFilterParams params) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Luôn ẩn HIDDEN products (trừ khi FE gửi rõ status=HIDDEN)
            if (params.getStatus() == null) {
                predicates.add(cb.notEqual(root.get("status"), ProductStatus.HIDDEN));
            }

            // Keyword: LIKE trên name + description
            if (params.getKeyword() != null && !params.getKeyword().isBlank()) {
                String pattern = "%" + params.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            // Category
            if (params.getCategory() != null && !params.getCategory().isBlank()) {
                try {
                    ProductCategory cat = ProductCategory.valueOf(params.getCategory().toUpperCase());
                    predicates.add(cb.equal(root.get("category"), cat));
                } catch (IllegalArgumentException ignored) {
                    // Invalid category → bỏ qua filter
                }
            }

            // Lazy-init shop join — reuse cho province, shopSlug, shopId
            Join<Product, Shop> shopJoin = null;

            // Province (join Shop)
            if (params.getProvince() != null && !params.getProvince().isBlank()) {
                shopJoin = root.join("shop", JoinType.LEFT);
                predicates.add(cb.equal(shopJoin.get("province"), params.getProvince()));
            }

            // Price range
            if (params.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerUnit"), params.getMinPrice()));
            }
            if (params.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerUnit"), params.getMaxPrice()));
            }

            // Farming method
            if (params.getFarmingMethod() != null && !params.getFarmingMethod().isBlank()) {
                try {
                    FarmingMethod method = FarmingMethod.valueOf(params.getFarmingMethod().toUpperCase());
                    predicates.add(cb.equal(root.get("farmingMethod"), method));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Status
            if (params.getStatus() != null && !params.getStatus().isBlank()) {
                try {
                    ProductStatus status = ProductStatus.valueOf(params.getStatus().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), status));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Pesticide free
            if (params.getPesticideFree() != null) {
                predicates.add(cb.equal(root.get("pesticideFree"), params.getPesticideFree()));
            }

            // Shop ID
            if (params.getShopId() != null) {
                predicates.add(cb.equal(root.get("shop").get("id"), params.getShopId()));
            }

            // Shop slug (reuse existing join if available)
            if (params.getShopSlug() != null && !params.getShopSlug().isBlank()) {
                if (shopJoin == null) {
                    shopJoin = root.join("shop", JoinType.LEFT);
                }
                predicates.add(cb.equal(shopJoin.get("slug"), params.getShopSlug()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
