package com.capnong.service;

import com.capnong.dto.request.CaptionGenerateRequest;
import com.capnong.dto.request.PosterGenerateRequest;
import com.capnong.dto.response.AiSessionResultDto;

import java.util.UUID;

public interface AiMarketingService {
    UUID startCaptionSession(CaptionGenerateRequest request, String username);
    void processCaptionAsync(UUID sessionId, CaptionGenerateRequest request);
    UUID startPosterSession(PosterGenerateRequest request, String username);
    void processPosterAsync(UUID sessionId, PosterGenerateRequest request, String mode);
    AiSessionResultDto getSessionResult(UUID sessionId);
}
