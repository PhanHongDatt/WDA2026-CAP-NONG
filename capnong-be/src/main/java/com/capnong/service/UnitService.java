package com.capnong.service;

import com.capnong.dto.response.UnitResponse;

import java.util.List;
import java.util.UUID;
import com.capnong.dto.request.UnitCreateRequest;
import com.capnong.dto.request.UnitUpdateRequest;

public interface UnitService {
    List<UnitResponse> getAllUnits();
    UnitResponse getByCode(String code);
    UnitResponse createUnit(UnitCreateRequest request);
    UnitResponse updateUnit(UUID id, UnitUpdateRequest request);
    void deleteUnit(UUID id);
}
