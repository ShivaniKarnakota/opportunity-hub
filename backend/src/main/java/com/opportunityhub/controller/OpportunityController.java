package com.opportunityhub.controller;

import com.opportunityhub.model.Opportunity;
import com.opportunityhub.service.OpportunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Opportunity-related endpoints.
 * Base path: /opportunities
 */
@RestController
@RequestMapping("/opportunities")
@CrossOrigin(origins = "*") // Allow all origins for frontend development
public class OpportunityController {

    @Autowired
    private OpportunityService opportunityService;

    /**
     * GET /opportunities
     * Returns all APPROVED opportunities (for regular users / home page).
     */
    @GetMapping
    public ResponseEntity<List<Opportunity>> getAllApproved() {
        List<Opportunity> opportunities = opportunityService.getAllApprovedOpportunities();
        return ResponseEntity.ok(opportunities);
    }

    /**
     * GET /opportunities/all
     * Returns ALL opportunities regardless of status (admin dashboard).
     */
    @GetMapping("/all")
    public ResponseEntity<List<Opportunity>> getAll() {
        List<Opportunity> opportunities = opportunityService.getAllOpportunities();
        return ResponseEntity.ok(opportunities);
    }

    /**
     * GET /opportunities/pending
     * Returns only PENDING opportunities (for admin review).
     */
    @GetMapping("/pending")
    public ResponseEntity<List<Opportunity>> getPending() {
        List<Opportunity> opportunities = opportunityService.getPendingOpportunities();
        return ResponseEntity.ok(opportunities);
    }

    /**
     * POST /opportunities
     * Submit a new opportunity. Status starts as PENDING.
     * Request body: Opportunity JSON
     */
    @PostMapping
    public ResponseEntity<Opportunity> addOpportunity(@RequestBody Opportunity opportunity) {
        Opportunity saved = opportunityService.addOpportunity(opportunity);
        return ResponseEntity.ok(saved);
    }

    /**
     * PUT /opportunities/{id}/status
     * Update approval status (admin action: APPROVED or REJECTED).
     * Request body: { "status": "APPROVED" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body("Status is required");
        }
        try {
            Opportunity updated = opportunityService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /opportunities/{id}
     * Delete an opportunity (admin only).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOpportunity(@PathVariable String id) {
        opportunityService.deleteOpportunity(id);
        return ResponseEntity.ok("Opportunity deleted successfully");
    }

    /**
     * GET /opportunities/category/{category}
     * Get opportunities filtered by category.
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Opportunity>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(opportunityService.getByCategory(category));
    }
}
