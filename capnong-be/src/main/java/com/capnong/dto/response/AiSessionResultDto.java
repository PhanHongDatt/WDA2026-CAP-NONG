package com.capnong.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AiSessionResultDto {
    private UUID sessionId;
    private String sessionType;
    private String status;

    // Caption result (null nếu không phải caption session)
    private CaptionResultData caption;

    // Poster result (null nếu không phải poster session)
    private PosterResultData poster;

    private String errorMessage;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CaptionResultData {
        private List<CaptionItem> captions;
        private List<String> hashtags;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CaptionItem {
        private String style;
        private String text;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PosterResultData {
        private String mode;           // HTML or AI_IMAGE
        // HTML mode fields
        private String template;
        private String headline;
        private String tagline;
        private String priceDisplay;
        private List<String> badgeTexts;
        private String shopDisplay;
        private String ctaText;
        private ColorScheme colorScheme;
        private String noBgImageUrl;
        // AI Image mode fields
        private String imageBase64;
        private String mimeType;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ColorScheme {
        private String primary;
        private String accent;
        private String textOnPrimary;
        private String background;
    }
}
