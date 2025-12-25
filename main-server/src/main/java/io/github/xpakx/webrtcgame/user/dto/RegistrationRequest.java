package io.github.xpakx.webrtcgame.user.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Objects;

public record RegistrationRequest(

        @NotBlank(message = "Username cannot be empty")
        @Size(min=5, max=15, message = "Username length must be between 5 and 15")
        String username,
        @NotBlank(message = "Password cannot be empty")
        String password,
        String passwordRe
) {
    @AssertTrue(message = "Passwords don't match!")
    public boolean isPasswordRepeated() {
        return Objects.equals(password, passwordRe);
    }
}
