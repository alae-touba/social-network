package com.qanetwork.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record FollowId(String userId, String topicId) implements Serializable {
}
