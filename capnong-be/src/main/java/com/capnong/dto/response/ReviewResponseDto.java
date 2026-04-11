package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ReviewResponseDto {
    private UUID id;
    private UserSummaryDto author;
    private UUID productId;
    private Integer rating;
    private String comment;
    private List<String> images;
    private String sellerReply;
    private LocalDateTime createdAt;
}
