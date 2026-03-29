package com.opportunityhub.service;

import com.opportunityhub.model.Opportunity;
import com.opportunityhub.repository.OpportunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for business logic related to Opportunities.
 */
@Service
public class OpportunityService {

    @Autowired
    private OpportunityRepository opportunityRepository;

    /**
     * Get all APPROVED opportunities (visible to regular users).
     */
    public List<Opportunity> getAllApprovedOpportunities() {
        return opportunityRepository.findByStatus("APPROVED");
    }

    /**
     * Get ALL opportunities (admin use — includes PENDING, APPROVED, REJECTED).
     */
    public List<Opportunity> getAllOpportunities() {
        return opportunityRepository.findAll();
    }

    /**
     * Get only PENDING opportunities (for admin review).
     */
    public List<Opportunity> getPendingOpportunities() {
        return opportunityRepository.findByStatus("PENDING");
    }

    /**
     * Add a new opportunity. Status defaults to PENDING.
     */
    public Opportunity addOpportunity(Opportunity opportunity) {
        opportunity.setStatus("PENDING");
        opportunity.setCreatedAt(LocalDateTime.now());
        return opportunityRepository.save(opportunity);
    }

    /**
     * Update the status of an opportunity (APPROVED or REJECTED).
     * Only admins should call this endpoint.
     */
    public Opportunity updateStatus(String id, String status) {
        Optional<Opportunity> optional = opportunityRepository.findById(id);
        if (optional.isPresent()) {
            Opportunity opp = optional.get();
            opp.setStatus(status.toUpperCase()); // Normalize to uppercase
            return opportunityRepository.save(opp);
        }
        throw new RuntimeException("Opportunity not found with id: " + id);
    }

    /**
     * Get a single opportunity by its ID.
     */
    public Optional<Opportunity> getById(String id) {
        return opportunityRepository.findById(id);
    }

    /**
     * Delete an opportunity by ID (admin only).
     */
    public void deleteOpportunity(String id) {
        opportunityRepository.deleteById(id);
    }

    /**
     * Get opportunities filtered by category.
     */
    public List<Opportunity> getByCategory(String category) {
        return opportunityRepository.findByCategory(category);
    }
}
