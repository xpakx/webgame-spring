package io.github.xpakx.webrtcgame.user.dto;

public record RegistrationRequest(
        String username,
        String password,
        String passwordRe
) {
}
