package com.capnong.dto.response;

import lombok.*;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PageResponseDto<T> {
    private List<T> data;
    private PaginationDto pagination;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaginationDto {
        private Integer page;
        private Integer limit;
        private Long total;
        private Integer totalPages;
    }

    public static <T> PageResponseDto<T> of(List<T> data, int page, int limit, long total) {
        int totalPages = (int) Math.ceil((double) total / limit);
        return PageResponseDto.<T>builder()
                .data(data)
                .pagination(PaginationDto.builder()
                        .page(page)
                        .limit(limit)
                        .total(total)
                        .totalPages(totalPages)
                        .build())
                .build();
    }
}
