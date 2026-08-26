package com.qanetwork.repository;

import java.util.Collection;
import java.util.List;

import com.qanetwork.domain.Like;
import com.qanetwork.domain.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LikeRepository extends JpaRepository<Like, LikeId> {

	boolean existsById(LikeId id);

	long countByIdAnswerId(String answerId);

	@Query("select l.id.answerId from Like l where l.id.userId = :userId and l.id.answerId in :answerIds")
	List<String> findLikedAnswerIds(@Param("userId") String userId, @Param("answerIds") Collection<String> answerIds);
}
