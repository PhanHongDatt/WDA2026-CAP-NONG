package com.capnong.service.impl;

import com.capnong.dto.response.UnitResponse;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.Unit;
import com.capnong.repository.UnitRepository;
import com.capnong.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UnitResponse> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UnitResponse getByCode(String code) {
        Unit unit = unitRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "code", code));
        return mapToResponse(unit);
    }

    @Override
    @Transactional
    public UnitResponse createUnit(com.capnong.dto.request.UnitCreateRequest request) {
        if (unitRepository.existsByCode(request.getCode())) {
            throw new com.capnong.exception.AppException("Mã đơn vị đã tồn tại: " + request.getCode(), org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        Unit baseUnit = null;
        if (request.getBaseUnitCode() != null && !request.getBaseUnitCode().isBlank()) {
            baseUnit = unitRepository.findByCode(request.getBaseUnitCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Base Unit", "code", request.getBaseUnitCode()));
        }

        Unit unit = Unit.builder()
                .code(request.getCode())
                .displayName(request.getDisplayName())
                .symbol(request.getSymbol())
                .baseUnit(baseUnit)
                .conversionFactor(request.getConversionFactor())
                .category(com.capnong.model.enums.UnitCategory.valueOf(request.getCategory().toUpperCase()))
                .aliases(request.getAliases())
                .build();
        
        return mapToResponse(unitRepository.save(unit));
    }

    @Override
    @Transactional
    public UnitResponse updateUnit(java.util.UUID id, com.capnong.dto.request.UnitUpdateRequest request) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", id));

        Unit baseUnit = null;
        if (request.getBaseUnitCode() != null && !request.getBaseUnitCode().isBlank()) {
            baseUnit = unitRepository.findByCode(request.getBaseUnitCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Base Unit", "code", request.getBaseUnitCode()));
        }

        unit.setDisplayName(request.getDisplayName());
        unit.setSymbol(request.getSymbol());
        unit.setBaseUnit(baseUnit);
        unit.setConversionFactor(request.getConversionFactor());
        unit.setCategory(com.capnong.model.enums.UnitCategory.valueOf(request.getCategory().toUpperCase()));
        unit.setAliases(request.getAliases());

        return mapToResponse(unitRepository.save(unit));
    }

    @Override
    @Transactional
    public void deleteUnit(java.util.UUID id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", id));
        // Soft delete via BaseEntity
        unit.softDelete("ADMIN");
        unitRepository.save(unit);
    }

    private UnitResponse mapToResponse(Unit unit) {
        return UnitResponse.builder()
                .id(unit.getId())
                .code(unit.getCode())
                .displayName(unit.getDisplayName())
                .symbol(unit.getSymbol())
                .baseUnitCode(unit.getBaseUnit() != null ? unit.getBaseUnit().getCode() : null)
                .conversionFactor(unit.getConversionFactor())
                .category(unit.getCategory().name())
                .aliases(unit.getAliases())
                .build();
    }
}
