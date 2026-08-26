const prisma = require("../config/db")
const { notFound } = require("../middleware/errors")
const { topicSummary } = require("../middleware/serializers")

const AUTHOR_BRIEF = { select: { id: true, firstName: true, lastName: true, imageName: true } }
const WITH_FOLLOWER_COUNT = { include: { _count: { select: { followers: true } } } }

/** GET /api/topics?search= - list all topics, optionally filtered by name. */
exports.list = async (req, res, next) => {
	try {
		const topics = await prisma.topic.findMany({
			where: req.query.search ? { name: { contains: req.query.search, mode: "insensitive" } } : {},
			orderBy: { name: "asc" },
			...WITH_FOLLOWER_COUNT
		})
		res.json(topics.map(topicSummary))
	} catch (error) {
		next(error)
	}
}

/** POST /api/topics - create a topic (auth). Duplicate names become 409. */
exports.create = async (req, res, next) => {
	try {
		const { name, description } = req.body
		const topic = await prisma.topic.create({
			data: {
				name,
				description,
				imageName: req.file ? req.file.filename : "default-topic.svg",
				userId: req.user.id
			},
			...WITH_FOLLOWER_COUNT
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
		const topic = await prisma.topic.findUnique({
			where: { id: req.params.id },
			include: { author: AUTHOR_BRIEF, ...WITH_FOLLOWER_COUNT.include }
		})
		if (!topic) throw notFound("Topic not found.")

		const questions = await prisma.question.findMany({
			where: { topicId: topic.id },
			orderBy: { creationDate: "desc" },
			include: { user: AUTHOR_BRIEF }
		})

		const answersByQuestion = new Map(questions.map((question) => [question.id, []]))
		if (questions.length > 0) {
			const answers = await prisma.answer.findMany({
				where: { questionId: { in: questions.map((q) => q.id) } },
				orderBy: { creationDate: "asc" },
				include: { user: AUTHOR_BRIEF, _count: { select: { likes: true } } }
			})
			for (const answer of answers) {
				answersByQuestion.get(answer.questionId)?.push(answer)
			}
		}

		let isFollowing = false
		let followedTopicIds = []
		if (req.user) {
			const follows = await prisma.follow.findMany({ where: { userId: req.user.id }, select: { topicId: true } })
			followedTopicIds = follows.map((follow) => follow.topicId)
			isFollowing = followedTopicIds.includes(topic.id)
		}

		// Sidebar: everything the user does not already follow (including this topic).
		const otherTopics = await prisma.topic.findMany({
			where: { id: { notIn: [...followedTopicIds, topic.id] } },
			orderBy: { name: "asc" },
			...WITH_FOLLOWER_COUNT
		})

		res.json({
			topic: {
				...topicSummary(topic),
				user: topic.author,
				isFollowing,
				questions: questions.map((question) => ({
					id: question.id,
					content: question.content,
					creationDate: question.creationDate,
					user: question.user,
					firstAnswer: answersByQuestion.get(question.id)[0] ?? null
				}))
			},
			otherTopics: otherTopics.map(topicSummary)
		})
	} catch (error) {
		next(error)
	}
}

/** POST /api/topics/:id/follow - toggle following (auth). The composite PK in
 * the follows table makes duplicate entries impossible. */
exports.toggleFollow = async (req, res, next) => {
	try {
		const topic = await prisma.topic.findUnique({ where: { id: req.params.id }, select: { id: true } })
		if (!topic) throw notFound("Topic not found.")

		const key = { userId_topicId: { userId: req.user.id, topicId: topic.id } }

		const existing = await prisma.follow.findUnique({ where: key })
		if (existing) {
			await prisma.follow.delete({ where: key })
		} else {
			await prisma.follow.create({ data: { userId: req.user.id, topicId: topic.id } }).catch(() => undefined)
		}

		const followerCount = await prisma.follow.count({ where: { topicId: topic.id } })
		res.json({ isFollowing: !existing, followerCount })
	} catch (error) {
		next(error)
	}
}
