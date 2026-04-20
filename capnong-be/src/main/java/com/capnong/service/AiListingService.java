package com.capnong.service;

import com.capnong.dto.request.AiRefineRequest;
import com.capnong.dto.response.AiRefineResponse;

import java.util.UUID;

public interface AiListingService {
    UUID startVoiceExtractionSession(String username, String transcript, String language, String audioFileUrl);
    AiRefineResponse refineDescription(AiRefineRequest request, String username);
    
    com.capnong.dto.response.PriceAdviceResponse getPriceAdvice(com.capnong.dto.request.PriceAdviceRequest request);
}
