package io.github.xpakx.webrtcgame.user;

import io.github.xpakx.webrtcgame.user.dto.AuthenticationResponse;
import io.github.xpakx.webrtcgame.user.dto.RegistrationRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AccountService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody @Valid RegistrationRequest registrationRequest) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.register((registrationRequest)));

    }

}
