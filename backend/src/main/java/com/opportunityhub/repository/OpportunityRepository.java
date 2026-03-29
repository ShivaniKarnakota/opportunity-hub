package com.opportunityhub.repository;

import com.opportunityhub.model.Opportunity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for Opportunity documents.
 * Spring Data automatically implements CRUD methods.
 */
@Repository
public interface OpportunityRepository extends MongoRepository<Opportunity, String> {

    // Find all opportunities by their approval status
    List<Opportunity> findByStatus(String status);

    // Find all opportunities posted by a specific user
    List<Opportunity> findByPostedBy(String username);

    // Find opportunities by category
    List<Opportunity> findByCategory(String category);
}
