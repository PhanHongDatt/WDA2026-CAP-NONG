package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.model.Unit;
import com.capnong.repository.UnitRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/units")
public class UnitController {

    private final UnitRepository unitRepository;

    public UnitController(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Unit>>> getAllUnits() {
        List<Unit> units = unitRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("OK", units));
    }
}
