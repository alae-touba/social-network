const prisma = require("../config/db")
const { notFound } = require("../middleware/errors")
const { userBrief } = require("../middleware/serializers")

const AUTHOR_BRIEF = { select: { id: true, firstName: true, lastName: true, imageName: true } }

function answerView(answer, likedAnswerIds) {
	return {
		id: answer.id,
		content: answer.content,
		creationDate: answer.creationDate,
		user: answer.user,
		likeCount: answer._count ? answer._count.likes : 0,
		likedByMe: likedAnswerIds.has(answer.id)
	}
}

async function likedAnswerIds(userId, answerIdFilter) {
	if (!userId) return new Set()
	const likes = await prisma.like.findMany({
		where: { userId, ...(answerIdFilter ? { answerId: { in: answerIdFilter } } : {}) },
		select: { answerId: true }
	})
	return new Set(likes.map((like) => like.answerId))
}

/** GET /api/questions/:id - question with all its answers and sibling questions. */
exports.detail = async (req, res, next) => {
	try {
		const question = await prisma.question.findUnique({
			where: { id: req.params.id },
			include: { user: AUTHOR_BRIEF, topic: { select: { id: true, name: true } } }
		})
		if (!question) throw notFound("Question not found.")

		const [answers, otherQuestions, likedIds] = await Promise.all([
			prisma.answer.findMany({
				where: { questionId: question.id },
				orderBy: { creationDate: "asc" },
				include: { user: AUTHOR_BRIEF, _count: { select: { likes: true } } }
			}),
			prisma.question.findMany({
				where: { topicId: question.topicId, id: { not: question.id } },
				orderBy: { creationDate: "desc" },
				select: { id: true, content: true }
			}),
			likedAnswerIds(req.user?.id)
		])

		res.json({
			question: {
				id: question.id,
				content: question.content,
				creationDate: question.creationDate,
				user: question.user,
				topic: question.topic,
				answers: answers.map((answer) => answerView(answer, likedIds))
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
		const topic = await prisma.topic.findUnique({ where: { id: req.params.id }, select: { id: true } })
		if (!topic) throw notFound("Topic not found.")

		const question = await prisma.question.create({
			data: { content: req.body.content, userId: req.user.id, topicId: topic.id }
		})

		res.status(201).json({ question })
	} catch (error) {
		next(error)
	}
}

/** POST /api/questions/:id/answers - add an answer (auth). */
exports.createAnswer = async (req, res, next) => {
	try {
		const question = await prisma.question.findUnique({ where: { id: req.params.id }, select: { id: true } })
		if (!question) throw notFound("Question not found.")

		const answer = await prisma.answer.create({
			data: { content: req.body.content, userId: req.user.id, questionId: question.id }
		})

		res.status(201).json({
			answer: answerView(
				{ ...answer, user: userBrief(req.user), _count: { likes: 0 } },
				new Set()
			)
		})
	} catch (error) {
		next(error)
	}
}

/** POST /api/answers/:id/like - toggle like (auth). The composite PK in the
 * likes table makes duplicate entries impossible. */
exports.toggleLike = async (req, res, next) => {
	try {
		const answer = await prisma.answer.findUnique({ where: { id: req.params.id }, select: { id: true } })
		if (!answer) throw notFound("Answer not found.")

		const key = { userId_answerId: { userId: req.user.id, answerId: answer.id } }

		const existing = await prisma.like.findUnique({ where: key })
		if (existing) {
			await prisma.like.delete({ where: key })
		} else {
			await prisma.like.create({ data: { userId: req.user.id, answerId: answer.id } }).catch(() => undefined)
		}

		const likeCount = await prisma.like.count({ where: { answerId: answer.id } })
		res.json({ isLiked: !existing, likeCount })
	} catch (error) {
		next(error)
	}
}
