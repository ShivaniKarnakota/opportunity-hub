package com.opportunityhub.controller;

import com.opportunityhub.model.Opportunity;
import com.opportunityhub.model.User;
import com.opportunityhub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for User-related endpoints.
 * Handles registration, login, and saved opportunities.
 */
@RestController
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * POST /register
     * Register a new user.
     * Request body: { "username": "...", "email": "...", "password": "..." }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        String error = userService.registerUser(user);
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("error", error));
        }
        return ResponseEntity.ok(Map.of("message", "Registration successful"));
    }

    /**
     * POST /login
     * Authenticate a user.
     * Request body: { "username": "...", "password": "..." }
     * Returns user info (including role) on success.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password required"));
        }

        User user = userService.loginUser(username, password);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }

        // Return user info (never return the password!)
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }

    /**
     * GET /saved?username={username}
     * Get all saved/bookmarked opportunities for the given user.
     */
    @GetMapping("/saved")
    public ResponseEntity<List<Opportunity>> getSaved(@RequestParam String username) {
        List<Opportunity> saved = userService.getSavedOpportunities(username);
        return ResponseEntity.ok(saved);
    }

    /**
     * POST /save
     * Save (bookmark) an opportunity for a user.
     * Request body: { "username": "...", "opportunityId": "..." }
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveOpportunity(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String opportunityId = body.get("opportunityId");

        if (username == null || opportunityId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and opportunityId required"));
        }

        String error = userService.saveOpportunity(username, opportunityId);
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("error", error));
        }
        return ResponseEntity.ok(Map.of("message", "Opportunity saved successfully"));
    }

    /**
     * DELETE /save
     * Remove a saved opportunity for a user.
     * Request body: { "username": "...", "opportunityId": "..." }
     */
    @DeleteMapping("/save")
    public ResponseEntity<?> unsaveOpportunity(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String opportunityId = body.get("opportunityId");

        String error = userService.unsaveOpportunity(username, opportunityId);
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("error", error));
        }
        return ResponseEntity.ok(Map.of("message", "Removed from saved"));
    }
}
