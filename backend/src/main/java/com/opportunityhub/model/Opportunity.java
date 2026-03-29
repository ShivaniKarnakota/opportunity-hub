package com.opportunityhub.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a job/internship opportunity in the system.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "opportunities")
public class Opportunity {

    @Id
    private String id;

    private String title;        // Job/internship title
    private String company;      // Company name
    private String location;     // Location (Remote, City, etc.)
    private String link;         // Application link URL
    private String description;  // Brief description

    /**
     * Status values: PENDING, APPROVED, REJECTED
     * New opportunities default to PENDING, admin can approve/reject
     */
    private String status = "PENDING";

    private String postedBy;     // Username who posted this opportunity
    private LocalDateTime createdAt = LocalDateTime.now();

    // Category (e.g., "Engineering", "Design", "Marketing")
    private String category;

    // Stipend / Salary info
    private String stipend;

    // Duration (e.g., "3 months", "6 months")
    private String duration;
}
