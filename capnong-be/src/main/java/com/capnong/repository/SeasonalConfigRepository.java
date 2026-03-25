package com.capnong.repository;

import com.capnong.model.SeasonalConfig;
import com.capnong.model.enums.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeasonalConfigRepository extends JpaRepository<SeasonalConfig, UUID> {
    Optional<SeasonalConfig> findByProvinceAndProductCategory(String province, ProductCategory category);
    List<SeasonalConfig> findByProvince(String province);
}
