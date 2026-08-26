package com.qanetwork.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Pure join table: the composite primary key already prevents duplicates. */
@Entity
@Table(name = "likes")
public class Like {

	@EmbeddedId
	private LikeId id;

	public Like() {
	}

	public Like(LikeId id) {
		this.id = id;
	}

	public LikeId getId() {
		return id;
	}
}
