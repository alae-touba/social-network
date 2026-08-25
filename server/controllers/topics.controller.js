const { User, Topic, Question, Answer } = require("../models")
const { notFound } = require("../middleware/errors")

function topicSummary(topic) {
	return {
		id: topic.id,
		name: topic.name,
		description: topic.description,
		imageName: topic.imageName,
		creationDate: topic.creationDate,
		followerCount: topic.usersFollowers.length
	}
}

/** GET /api/topics?search= - list all topics, optionally filtered by name. */
exports.list = async (req, res, next) => {
	try {
		const filter = {}
		if (req.query.search) {
			// Escape regex metacharacters so user input can't break (or abuse) the query.
			const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
			filter.name = { $regex: escaped, $options: "i" }
		}

		const topics = await Topic.find(filter)
		res.json(topics.map(topicSummary))
	} catch (error) {
		next(error)
	}
}

/** POST /api/topics - create a topic (auth). */
exports.create = async (req, res, next) => {
	try {
		const { name, description } = req.body
		const topic = await Topic.create({
			name,
			description,
			imageName: req.file ? req.file.filename : "default-topic.svg",
			user: req.user.id
		})
		res.status(201).json({ topic: topicSummary(topic) })
	} catch (error) {
		next(error)
	}
}

/**
 * GET /api/topics/:id - topic detail with its questions (each with a preview
 * of its first answer), plus the sidebar data: whether the current user
 * follows this topic and which other topics they might like.
 */
exports.detail = async (req, res, next) => {
	try {
		const topic = await Topic.findById(req.params.id).populate("user", "firstName lastName imageName")
		if (!topic) throw notFound("Topic not found.")

		const questions = await Question.find({ topic: topic.id })
			.sort({ creationDate: "desc" })
			.populate("user", "firstName lastName imageName")

		const answerIdsByQuestion = new Map()
		for (const question of questions) {
			answerIdsByQuestion.set(question.id, [])
		}
		if (questions.length > 0) {
			const answers = await Answer.find({ question: { $in: questions.map((q) => q._id) } })
				.sort({ creationDate: "asc" })
				.populate("user", "firstName lastName imageName")
			for (const answer of answers) {
				const questionId = String(answer.question)
				if (answerIdsByQuestion.has(questionId)) {
					answerIdsByQuestion.get(questionId).push(answer)
				}
			}
		}

		let isFollowing = false
		if (req.user) {
			isFollowing = req.user.topicsFollowed.some((id) => id.equals(topic._id))
		}

		// Sidebar: everything the user does not already follow (including this topic).
		const otherTopics = req.user
			? await Topic.find({ _id: { $nin: [...req.user.topicsFollowed, topic._id] } })
			: await Topic.find({ _id: { $ne: topic._id } })

		res.json({
			topic: {
				...topicSummary(topic),
				user: topic.user,
				isFollowing,
				questions: questions.map((question) => ({
					id: question.id,
					content: question.content,
					creationDate: question.creationDate,
					user: question.user,
					firstAnswer: answerIdsByQuestion.get(question.id)[0] ?? null
				}))
			},
			otherTopics: otherTopics.map(topicSummary)
		})
	} catch (error) {
		next(error)
	}
}

/** POST /api/topics/:id/follow - toggle following (auth), atomically. */
exports.toggleFollow = async (req, res, next) => {
	try {
		const topic = await Topic.findById(req.params.id)
		if (!topic) throw notFound("Topic not found.")

		const wasFollowing = topic.usersFollowers.some((id) => id.equals(req.user._id))

		const update = wasFollowing ? { $pull: { usersFollowers: req.user._id } } : { $addToSet: { usersFollowers: req.user._id } }
		const inverseUpdate = wasFollowing ? { $pull: { topicsFollowed: topic._id } } : { $addToSet: { topicsFollowed: topic._id } }

		// Atomic array updates: no read-modify-write race, no duplicates.
		const [, updatedUser] = await Promise.all([
			Topic.findByIdAndUpdate(topic._id, update),
			User.findByIdAndUpdate(req.user._id, inverseUpdate)
		])

		req.user.topicsFollowed = updatedUser.topicsFollowed

		res.json({ isFollowing: !wasFollowing, followerCount: topic.usersFollowers.length + (wasFollowing ? -1 : 1) })
	} catch (error) {
		next(error)
	}
}
