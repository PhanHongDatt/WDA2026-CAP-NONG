package com.capnong.kafka;

/**
 * Định nghĩa tên các Kafka topics dùng trong hệ thống.
 */
public final class KafkaTopics {
    private KafkaTopics() {}

    /** FE gửi transcript → BE tạo session → publish vào topic này */
    public static final String AI_VOICE_EXTRACTION_REQUEST = "ai.voice.extraction.request";

    /** Consumer xử lý xong → publish kết quả vào topic này */
    public static final String AI_VOICE_EXTRACTION_RESULT = "ai.voice.extraction.result";

    /** Refine description request (nếu cần async sau này) */
    public static final String AI_REFINE_REQUEST = "ai.refine.request";

    /** Refine description result */
    public static final String AI_REFINE_RESULT = "ai.refine.result";

    /** AI Caption generation */
    public static final String AI_CAPTION_REQUEST = "ai.caption.request";
    public static final String AI_CAPTION_RESULT = "ai.caption.result";

    /** AI Poster generation */
    public static final String AI_POSTER_REQUEST = "ai.poster.request";
    public static final String AI_POSTER_RESULT = "ai.poster.result";
}
