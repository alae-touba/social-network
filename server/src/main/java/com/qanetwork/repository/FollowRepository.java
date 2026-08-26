package com.qanetwork.repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.qanetwork.domain.Follow;
import com.qanetwork.domain.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {

	boolean existsById(FollowId id);

	long countByIdTopicId(String topicId);

	@Query("select f.id.topicId from Follow f where f.id.userId = :userId")
	List<String> findTopicIdsByUserId(@Param("userId") String userId);

	@Query("""
			select f.id.topicId, count(f) from Follow f
			where f.id.topicId in :topicIds
			group by f.id.topicId
			""")
	List<Object[]> countByTopicIds(@Param("topicIds") Collection<String> topicIds);

	default Map<String, Long> followerCounts(Collection<String> topicIds) {
		if (topicIds.isEmpty()) {
			return Map.of();
		}
		return countByTopicIds(topicIds).stream()
				.collect(Collectors.toMap(row -> (String) row[0], row -> (Long) row[1]));
	}
}
