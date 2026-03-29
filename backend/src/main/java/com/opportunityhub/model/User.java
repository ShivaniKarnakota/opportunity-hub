package com.opportunityhub.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a registered user in the system.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String username;
    private String email;
    private String password; // In production, always store hashed passwords!

    /**
     * Role values: "USER" or "ADMIN"
     */
    private String role = "USER";

    /**
     * List of saved/bookmarked opportunity IDs for this user.
     */
    private List<String> savedOpportunities = new ArrayList<>();
}
