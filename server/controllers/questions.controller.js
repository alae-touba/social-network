const { User, Topic, Question, Answer } = require("../models")
const { notFound } = require("../middleware/errors")

function answerView(answer, currentUser) {
	return {
		id: answer.id,
		content: answer.content,
		creationDate: answer.creationDate,
		user: answer.user,
		likeCount: answer.usersWhoLike.length,
		likedByMe: currentUser ? currentUser.answersLiked.some((id) => id.equals(answer._id)) : false
	}
}

/** GET /api/questions/:id - question with all its answers and sibling questions. */
exports.detail = async (req, res, next) => {
	try {
		const question = await Question.findById(req.params.id).populate("user", "firstName lastName imageName").populate("topic", "name")
		if (!question) throw notFound("Question not found.")

		const answers = await Answer.find({ question: question._id })
			.sort({ creationDate: "asc" })
			.populate("user", "firstName lastName imageName")

		const otherQuestions = await Question.find({ topic: question.topic._id, _id: { $ne: question._id } })
			.sort({ creationDate: "desc" })
			.select("content")

		res.json({
			question: {
				id: question.id,
				content: question.content,
				creationDate: question.creationDate,
				user: question.user,
				topic: question.topic,
				answers: answers.map((answer) => answerView(answer, req.user))
			},
			otherQuestions
		})
	} catch (error) {
		next(error)
	}
}

/** POST /api/topics/:id/questions - ask a question in a topic (auth). */
exports.create = async (req, res, next) => {
	try {
		const topic = await Topic.findById(req.params.id)
		if (!topic) throw notFound("Topic not found.")

		const question = await Question.create({
			content: req.body.content,
			user: req.user.id,
			topic: topic._id
		})

		res.status(201).json({ question })
	} catch (error) {
		next(error)
	}
}

/** POST /api/questions/:id/answers - add an answer (auth). */
exports.createAnswer = async (req, res, next) => {
	try {
		const question = await Question.findById(req.params.id)
		if (!question) throw notFound("Question not found.")

		const answer = await Answer.create({
			content: req.body.content,
			user: req.user.id,
			question: question._id
		})

		res.status(201).json({ answer: answerView(answer, req.user) })
	} catch (error) {
		next(error)
	}
}

/** POST /api/answers/:id/like - toggle like (auth), atomically. */
exports.toggleLike = async (req, res, next) => {
	try {
		const answer = await Answer.findById(req.params.id)
		if (!answer) throw notFound("Answer not found.")

		const wasLiked = answer.usersWhoLike.some((id) => id.equals(req.user._id))

		const update = wasLiked ? { $pull: { usersWhoLike: req.user._id } } : { $addToSet: { usersWhoLike: req.user._id } }
		const inverseUpdate = wasLiked ? { $pull: { answersLiked: answer._id } } : { $addToSet: { answersLiked: answer._id } }

		const [, updatedUser] = await Promise.all([
			Answer.findByIdAndUpdate(answer._id, update),
			User.findByIdAndUpdate(req.user._id, inverseUpdate)
		])

		req.user.answersLiked = updatedUser.answersLiked

		res.json({ isLiked: !wasLiked, likeCount: answer.usersWhoLike.length + (wasLiked ? -1 : 1) })
	} catch (error) {
		next(error)
	}
}
