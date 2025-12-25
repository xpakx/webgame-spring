package io.github.xpakx.webrtcgame.user.dto;

public record AuthenticationResponse(
    String token,
    String refreshToken,
    String username,
    boolean moderatorRole
) {
}
