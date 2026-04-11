package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class AiRefineResponse {
    private UUID sessionId;
    private String rawText;
    private String refinedText;
    private String changesSummary;
}
