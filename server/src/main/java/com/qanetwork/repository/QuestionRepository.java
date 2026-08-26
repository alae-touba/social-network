package com.qanetwork.repository;

import java.util.List;

import com.qanetwork.domain.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, String> {

	List<Question> findByTopicIdOrderByCreationDateDesc(String topicId);

	List<Question> findByTopicIdAndIdNotOrderByCreationDateDesc(String topicId, String id);

	List<Question> findByUserIdOrderByCreationDateDesc(String userId);
}
