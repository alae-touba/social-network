const { User, Topic, Question, Answer } = require("../models")
const { notFound } = require("../middleware/errors")

/**
 * GET /api/users/:id - profile data: the user plus everything they have
 * asked, answered, created and followed. The SPA renders this as tabs.
 */
exports.profile = async (req, res, next) => {
	try {
		const user = await User.findById(req.params.id)
		if (!user) throw notFound("User not found.")

		const [questions, answers, topicsCreated, topicsFollowed] = await Promise.all([
			Question.find({ user: user._id }).sort({ creationDate: "desc" }).select("content creationDate topic").populate("topic", "name"),
			Answer.find({ user: user._id }).sort({ creationDate: "desc" }).select("content creationDate question").populate("question", "content"),
			Topic.find({ user: user._id }).sort({ creationDate: "desc" }),
			Topic.find({ usersFollowers: user._id }).sort({ name: "asc" })
		])

		res.json({
			user,
			questions,
			answers,
			topicsCreated,
			topicsFollowed
		})
	} catch (error) {
		next(error)
	}
}
