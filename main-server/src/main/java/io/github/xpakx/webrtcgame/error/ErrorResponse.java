package io.github.xpakx.webrtcgame.error;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String message,
        String status,
        Integer error,
        List<String> errors
) {
}
