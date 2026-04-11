package com.capnong.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ReviewCreateRequest {
    @NotNull private UUID productId;
    @NotNull private UUID orderItemId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    @NotBlank @Size(min = 10) private String comment;
    @Size(max = 5) private List<String> images;
}
