package com.qanetwork.repository;

import java.util.Collection;
import java.util.List;

import com.qanetwork.domain.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepository extends JpaRepository<Answer, String> {

	List<Answer> findByQuestionIdOrderByCreationDateAsc(String questionId);

	List<Answer> findByQuestionIdInOrderByCreationDateAsc(Collection<String> questionIds);

	List<Answer> findByUserIdOrderByCreationDateDesc(String userId);
}
