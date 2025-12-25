package io.github.xpakx.webrtcgame.user;

import io.github.xpakx.webrtcgame.jwt.JwtUtils;
import io.github.xpakx.webrtcgame.user.dto.AuthenticationResponse;
import io.github.xpakx.webrtcgame.user.dto.RegistrationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository userRepository;
    private final JwtUtils jwtUtils;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegistrationRequest request) {
        testRequest(request);
        Account user = createNewAccount(request);
        final String token = jwtUtils.generateToken(userService.userAccountToUserDetails(user));
        final String refreshToken = jwtUtils.generateRefreshToken(request.username());
        return new AuthenticationResponse(
                token,
                refreshToken,
                user.getUsername(),
                false
        );
    }

    private Account createNewAccount(RegistrationRequest request) {
        Account userToAdd = new Account();
        userToAdd.setPassword(passwordEncoder.encode(request.password()));
        userToAdd.setUsername(request.username());
        userToAdd.setRoles(Collections.singleton("ROLE_USER"));
        return userRepository.save(userToAdd);
    }

    private void testRequest(RegistrationRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new RuntimeException("Username exists!");
        }
    }
}
