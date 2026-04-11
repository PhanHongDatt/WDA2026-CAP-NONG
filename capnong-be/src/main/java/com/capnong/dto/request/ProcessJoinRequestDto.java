package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProcessJoinRequestDto {
    @NotNull private Action action;
    private String note;

    public enum Action { APPROVE, REJECT }
}
