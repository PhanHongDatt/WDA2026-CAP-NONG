package com.capnong.repository;

import com.capnong.model.Unit;
import com.capnong.model.enums.UnitCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnitRepository extends JpaRepository<Unit, String> {
    List<Unit> findByCategory(UnitCategory category);
    List<Unit> findByBaseUnit(String baseUnit);
}
