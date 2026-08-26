package com.qanetwork.repository;

import java.util.Collection;
import java.util.List;

import com.qanetwork.domain.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TopicRepository extends JpaRepository<Topic, String> {

	boolean existsByNameIgnoreCase(String name);

	List<Topic> findByNameContainingIgnoreCaseOrderByNameAsc(String name);

	List<Topic> findByIdNotInOrderByNameAsc(Collection<String> ids);

	List<Topic> findByIdInOrderByNameAsc(Collection<String> ids);

	List<Topic> findByUserIdOrderByCreationDateDesc(String userId);
}
