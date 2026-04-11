package com.capnong.service;

import com.capnong.dto.request.SeasonalConfigRequest;
import com.capnong.dto.response.SeasonalConfigResponse;
import com.capnong.model.enums.ProductStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SeasonalConfigService {
    SeasonalConfigResponse createConfig(SeasonalConfigRequest request, String username, boolean isAdmin);
    SeasonalConfigResponse updateConfig(UUID id, SeasonalConfigRequest request, String username);
    List<SeasonalConfigResponse> getAllConfigs();
    List<SeasonalConfigResponse> getConfigsByProvince(String province);
    void deleteConfig(UUID id, String username);
    ProductStatus calculateProductStatus(String province, String category, LocalDate harvestDate, LocalDate availableFrom, java.math.BigDecimal quantity, LocalDate checkDate);
    void runSeasonalStatusUpdate();
}
