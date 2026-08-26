package com.qanetwork.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Pure join table: the composite primary key already prevents duplicates. */
@Entity
@Table(name = "follows")
public class Follow {

	@EmbeddedId
	private FollowId id;

	public Follow() {
	}

	public Follow(FollowId id) {
		this.id = id;
	}

	public FollowId getId() {
		return id;
	}
}
