package com.capnong.exception;

import com.capnong.dto.response.InventoryConflictDto;
import lombok.Getter;

import java.util.List;

@Getter
public class InsufficientStockException extends RuntimeException {

    private final List<InventoryConflictDto> conflicts;

    public InsufficientStockException(String message, List<InventoryConflictDto> conflicts) {
        super(message);
        this.conflicts = conflicts;
    }

    public InsufficientStockException(String message) {
        super(message);
        this.conflicts = List.of();
    }
}
