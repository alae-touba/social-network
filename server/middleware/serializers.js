/**
 * Explicit serializers keep the API responses identical to what the SPA
 * already consumes (and make sure sensitive fields never leak).
 */

function userBrief(user) {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		imageName: user.imageName
	}
}

function safeUser(user) {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		imageName: user.imageName,
		registrationDate: user.registrationDate
	}
}

/** Expects `_count.followers` to be included on the topic. */
function topicSummary(topic) {
	return {
		id: topic.id,
		name: topic.name,
		description: topic.description,
		imageName: topic.imageName,
		creationDate: topic.creationDate,
		followerCount: topic._count ? topic._count.followers : 0
	}
}

module.exports = { userBrief, safeUser, topicSummary }
