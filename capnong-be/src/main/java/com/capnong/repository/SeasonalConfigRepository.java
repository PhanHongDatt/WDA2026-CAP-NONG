package com.capnong.repository;

import com.capnong.model.SeasonalConfig;
import com.capnong.model.enums.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SeasonalConfigRepository extends JpaRepository<SeasonalConfig, UUID> {
    List<SeasonalConfig> findByProvinceAndProductCategory(String province, ProductCategory productCategory);
    List<SeasonalConfig> findByProvince(String province);
    List<SeasonalConfig> findByProductCategory(ProductCategory productCategory);
}
