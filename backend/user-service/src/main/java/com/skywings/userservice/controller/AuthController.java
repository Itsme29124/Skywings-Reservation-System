package com.skywings.userservice.controller;

import com.skywings.userservice.dto.*;
import com.skywings.userservice.entity.User;
import com.skywings.userservice.repository.UserRepository;
import com.skywings.userservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(409).body("Email already in use");
        }
        User user = new User();
        user.setEmail(req.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFullName(req.getFullName());
        user.setAdmin(req.getEmail().equalsIgnoreCase("admin@skywings.com"));
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.isAdmin());
        return ResponseEntity.ok(new AuthResponse(token, toDto(user)));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody AuthRequest req) {
        return userRepository.findByEmail(req.getEmail().toLowerCase())
                .filter(u -> passwordEncoder.matches(req.getPassword(), u.getPassword()))
                .map(u -> {
                    String token = jwtUtil.generateToken(u.getId(), u.getEmail(), u.isAdmin());
                    return ResponseEntity.ok(new AuthResponse(token, toDto(u)));
                })
                .orElse(ResponseEntity.status(401).build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        var claims = jwtUtil.parseToken(token);
        return userRepository.findById(claims.getSubject())
                .map(u -> ResponseEntity.ok(toDto(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    private UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getEmail(), u.getFullName(), u.isAdmin());
    }
}