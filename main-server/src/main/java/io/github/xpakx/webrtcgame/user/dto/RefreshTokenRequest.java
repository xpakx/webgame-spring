package io.github.xpakx.webrtcgame.user.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token cannot be empty!")
        String token
) {
}
