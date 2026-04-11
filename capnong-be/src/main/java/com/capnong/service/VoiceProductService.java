package com.capnong.service;

import com.capnong.dto.request.VoiceTranscriptRequest;
import com.capnong.dto.response.VoiceProductExtractionResponse;

public interface VoiceProductService {
    VoiceProductExtractionResponse extractProductFromVoice(VoiceTranscriptRequest request);
}
