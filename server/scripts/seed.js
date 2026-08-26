/**
 * Imports the original seed data (database/*.json, exported from the old
 * MongoDB app) into PostgreSQL. Idempotent: rows are upserted by id and
 * follows/likes use createMany with skipDuplicates.
 *
 * Run via `npm run seed` (prisma db seed) or `node scripts/seed.js`.
 */
const fs = require("fs")
const path = require("path")
const prisma = require("../config/db")

const SEED_DIR = path.resolve(__dirname, "..", "..", "database")

function load(name) {
	const file = path.join(SEED_DIR, `${name}.json`)
	if (!fs.existsSync(file)) {
		console.warn(`seed: ${file} not found, skipping`)
		return []
	}
	return JSON.parse(fs.readFileSync(file, "utf8"))
}

function ref(value) {
	return typeof value === "object" && value !== null ? value.$oid : value
}

function date(value) {
	return new Date(typeof value === "object" && value !== null ? value.$date : value)
}

async function main() {
	const [users, topics, questions, answers] = [load("users"), load("topics"), load("questions"), load("answers")]

	for (const user of users) {
		await prisma.user.upsert({
			where: { id: user._id.$oid },
			update: {},
			create: {
				id: user._id.$oid,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email.toLowerCase(),
				password: user.password,
				imageName: user.imageName,
				registrationDate: date(user.registrationDate)
			}
		})
	}

	for (const topic of topics) {
		await prisma.topic.upsert({
			where: { id: topic._id.$oid },
			update: {},
			create: {
				id: topic._id.$oid,
				name: topic.name,
				description: topic.description,
				imageName: topic.imageName,
				creationDate: date(topic.creationDate),
				userId: ref(topic.user)
			}
		})
	}

	for (const question of questions) {
		await prisma.question.upsert({
			where: { id: question._id.$oid },
			update: {},
			create: {
				id: question._id.$oid,
				content: question.content,
				creationDate: date(question.creationDate),
				userId: ref(question.user),
				topicId: ref(question.topic)
			}
		})
	}

	for (const answer of answers) {
		await prisma.answer.upsert({
			where: { id: answer._id.$oid },
			update: {},
			create: {
				id: answer._id.$oid,
				content: answer.content,
				creationDate: date(answer.creationDate),
				userId: ref(answer.user),
				questionId: ref(answer.question)
			}
		})
	}

	// Many-to-many relations were mirrored on both sides in the old data; union them.
	const followPairs = new Map()
	for (const user of users) {
		for (const topic of user.topicsFollowed ?? []) {
			followPairs.set(`${user._id.$oid}:${ref(topic)}`, { userId: user._id.$oid, topicId: ref(topic) })
		}
	}
	for (const topic of topics) {
		for (const follower of topic.usersFollowers ?? []) {
			followPairs.set(`${ref(follower)}:${topic._id.$oid}`, { userId: ref(follower), topicId: topic._id.$oid })
		}
	}

	const likePairs = new Map()
	for (const user of users) {
		for (const answer of user.answersLiked ?? []) {
			likePairs.set(`${user._id.$oid}:${ref(answer)}`, { userId: user._id.$oid, answerId: ref(answer) })
		}
	}
	for (const answer of answers) {
		for (const liker of answer.usersWhoLike ?? []) {
			likePairs.set(`${ref(liker)}:${answer._id.$oid}`, { userId: ref(liker), answerId: answer._id.$oid })
		}
	}

	await prisma.follow.createMany({ data: [...followPairs.values()], skipDuplicates: true })
	await prisma.like.createMany({ data: [...likePairs.values()], skipDuplicates: true })

	console.log(
		`seed done: ${users.length} users, ${topics.length} topics, ${questions.length} questions, ` +
			`${answers.length} answers, ${followPairs.size} follows, ${likePairs.size} likes`
	)
}

main()
	.catch((error) => {
		console.error("seed failed:", error.message)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
