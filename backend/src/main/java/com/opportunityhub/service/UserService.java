package com.opportunityhub.service;

import com.opportunityhub.model.Opportunity;
import com.opportunityhub.model.User;
import com.opportunityhub.repository.OpportunityRepository;
import com.opportunityhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for business logic related to Users.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    /**
     * Register a new user.
     * Returns error message string if validation fails, null if success.
     */
    public String registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return "Username already taken";
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return "Email already registered";
        }
        // In production: hash the password before saving!
        // user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return null; // null = success
    }

    /**
     * Authenticate a user by username + password.
     * Returns the User object if valid, null if invalid.
     */
    public User loginUser(String username, String password) {
        Optional<User> optional = userRepository.findByUsername(username);
        if (optional.isPresent()) {
            User user = optional.get();
            // In production: use passwordEncoder.matches(password, user.getPassword())
            if (user.getPassword().equals(password)) {
                return user;
            }
        }
        return null;
    }

    /**
     * Save (bookmark) an opportunity for a user.
     * Returns error message or null on success.
     */
    public String saveOpportunity(String username, String opportunityId) {
        Optional<User> optional = userRepository.findByUsername(username);
        if (optional.isEmpty()) {
            return "User not found";
        }
        User user = optional.get();
        List<String> saved = user.getSavedOpportunities();
        if (saved == null) {
            saved = new ArrayList<>();
        }
        if (!saved.contains(opportunityId)) {
            saved.add(opportunityId);
            user.setSavedOpportunities(saved);
            userRepository.save(user);
        }
        return null; // success
    }

    /**
     * Remove a saved opportunity for a user.
     */
    public String unsaveOpportunity(String username, String opportunityId) {
        Optional<User> optional = userRepository.findByUsername(username);
        if (optional.isEmpty()) {
            return "User not found";
        }
        User user = optional.get();
        List<String> saved = user.getSavedOpportunities();
        if (saved != null) {
            saved.remove(opportunityId);
            user.setSavedOpportunities(saved);
            userRepository.save(user);
        }
        return null;
    }

    /**
     * Get all saved/bookmarked opportunities for a user.
     */
    public List<Opportunity> getSavedOpportunities(String username) {
        Optional<User> optional = userRepository.findByUsername(username);
        if (optional.isEmpty()) {
            return new ArrayList<>();
        }
        User user = optional.get();
        List<String> savedIds = user.getSavedOpportunities();
        if (savedIds == null || savedIds.isEmpty()) {
            return new ArrayList<>();
        }
        // Fetch each opportunity by ID
        List<Opportunity> result = new ArrayList<>();
        for (String id : savedIds) {
            opportunityRepository.findById(id).ifPresent(result::add);
        }
        return result;
    }

    /**
     * Find user by username.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
