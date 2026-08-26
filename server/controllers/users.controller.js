const prisma = require("../config/db")
const { notFound } = require("../middleware/errors")
const { safeUser, topicSummary } = require("../middleware/serializers")

/**
 * GET /api/users/:id - profile data: the user plus everything they have
 * asked, answered, created and followed. The SPA renders this as tabs.
 */
exports.profile = async (req, res, next) => {
	try {
		const user = await prisma.user.findUnique({ where: { id: req.params.id } })
		if (!user) throw notFound("User not found.")

		const [questions, answers, topicsCreated, follows] = await Promise.all([
			prisma.question.findMany({
				where: { userId: user.id },
				orderBy: { creationDate: "desc" },
				select: { id: true, content: true, creationDate: true, topic: { select: { id: true, name: true } } }
			}),
			prisma.answer.findMany({
				where: { userId: user.id },
				orderBy: { creationDate: "desc" },
				select: { id: true, content: true, creationDate: true, question: { select: { id: true, content: true } } }
			}),
			prisma.topic.findMany({
				where: { userId: user.id },
				orderBy: { creationDate: "desc" },
				include: { _count: { select: { followers: true } } }
			}),
			prisma.follow.findMany({
				where: { userId: user.id },
				include: { topic: { include: { _count: { select: { followers: true } } } } },
				orderBy: { topic: { name: "asc" } }
			})
		])

		res.json({
			user: safeUser(user),
			questions,
			answers,
			topicsCreated: topicsCreated.map(topicSummary),
			topicsFollowed: follows.map((follow) => topicSummary(follow.topic))
		})
	} catch (error) {
		next(error)
	}
}
