const Topic = require("./../models/topic")
const Question = require("./../models/question")
const User = require("./../models/user")
const multer = require("multer")
const path = require("path")
const validator = require("express-validator")

//photo upload etup
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "..", "public", "images", "topics-images"))
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
	}
})
exports.upload = multer({ storage: storage })

//handling routes functions
exports.getAllTopics = async (req, res, next) => {
	const input = {
		title: "Topics",
		connectedUser: req.user
	}

	try {
		const topics = await Topic.find()
		input.topics = topics
		res.render("topics", input)
	} catch (error) {
		next(error)
	}
}

exports.getTopicById = async (req, res, next) => {
	const input = {
		connectedUser: req.user,
		title: "topic not found"
	}

	//other topics = all topics - (topics followed by user + current topic) = all topics - topics exluded
	const excludedTopicsIds = [] //topics excluded = topics followed by the user + current topic(if it exists)

	if (input.connectedUser) {
		input.connectedUser.topicsFollowed.forEach((topic) => excludedTopicsIds.push(topic._id))
	}

	try {
		const topic = await Topic.findById(req.params.id)
			.populate("user")
			.populate({
				path: "questions",
				populate: {
					path: "answers",
					perDocumentLimit: 1, //for each question only one answer
					populate: {
						path: "user"
					}
				}
			})

		if (topic) {
			input.topic = topic
			input.title = topic.name

			excludedTopicsIds.push(topic._id)

			//is user connected? if so, what topics does he follows? does he follows this topic?
			if (input.connectedUser) {
				// list of answers (that will be displayed at the page) ids
				const answersIds = topic.questions.map((qst) => qst.answers).map((answers) => (answers.length === 0 ? null : answers[0]._id))
				input.answersIds = answersIds.filter((answerId) => answerId) //remove null values

				input.connectedUserAnswersLiked = input.connectedUser.answersLiked

				input.isFollowing = {
					value: input.connectedUser.topicsFollowed.includes(topic._id) && topic.usersFollowers.includes(input.connectedUser._id)
				}
			}
		}
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			//do nothing
		} else {
			next(error)
		}
	} finally {
		if (input.connectedUser) {
			input.connectedUser = await User.findById(input.connectedUser._id).populate("topicsFollowed")
		}

		input.otherTopics = await Topic.find({
			_id: {
				$nin: excludedTopicsIds
			}
		})

		res.render("topic", input)
	}
}

exports.validateTopicFormFields = () => {
	return [
		validator
			.check("name")
			.notEmpty()
			.withMessage("name cannot be empty!")
			.isLength({ min: 2 })
			.withMessage("name length must be at least 2 chars!"),

		validator
			.check("description")
			.notEmpty()
			.withMessage("description cannot be empty!")
			.isLength({ min: 20 })
			.withMessage("descritpion length must be at least 20 chars!")
			.isLength({ max: 255 })
			.withMessage("description length must be at most 255 chars!")
	]
}

exports.handleCreateTopic = async (req, res, next) => {
	try {
		const errors = validator.validationResult(req)
		const input = {
			title: "create a topic",
			connectedUser: req.user
		}

		if (!errors.isEmpty()) {
			input.errors = errors.array()
		} else {
			const { name, description } = req.body
			const newTopic = await Topic.create({
				name,
				description,
				imageName: req.file ? req.file.filename : "default-topic-image.png",
				user: req.user._id
			})

			const updatedUser = await User.findByIdAndUpdate(
				req.user._id,
				{
					$push: { topics: newTopic._id }
				},
				{
					new: true,
					useFindAndModify: false
				}
			)

			input.successMessage = `topic ${name} successfully created`
		}
		res.render("create-topic", input)
	} catch (error) {
		next(error)
	}
}

exports.getCreateTopicPage = (req, res, next) => {
	input = {
		title: "create a topic",
		connectedUser: req.user
	}

	res.render("create-topic", input)
}

exports.validateQuestionFormFields = () => {
	return [
		validator
			.check("question")
			.notEmpty()
			.withMessage("question content cannot be empty!")
			.isLength({ min: 10 })
			.withMessage("question length must be at least 10 chars!")
	]
}

exports.handleCreateQuestion = async (req, res, next) => {
	const input = {
		title: "ask a question",
		connectedUser: req.user
	}

	try {
		const topicId = req.params.id
		const topic = await Topic.findById(topicId)

		if (topic) {
			const errors = validator.validationResult(req)

			if (!errors.isEmpty()) {
				input.errors = errors.array()
			} else {
				const { question } = req.body
				const connectedUser = req.user

				const newQuestion = await Question.create({
					content: question,
					user: connectedUser._id,
					topic: topicId
				})

				//add this question to topic's questions as well as user's questions
				const updatedUser = await User.findByIdAndUpdate(
					connectedUser._id,
					{
						$push: { questions: newQuestion._id }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)

				const updatedTopic = await Topic.findByIdAndUpdate(
					topicId,
					{
						$push: { questions: newQuestion._id }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)

				input.successMessage = "question successfull created"
			}

			input.topic = topic
		}

		res.render("ask-question", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("ask-question", input)
		} else {
			next(error)
		}
	}
}

exports.getAskQuestionPage = async (req, res, next) => {
	const input = {
		title: "Ask A Question",
		connectedUser: req.user
	}

	try {
		const topic = await Topic.findById(req.params.id)
		if (topic) {
			input.topic = topic
		}
		res.render("ask-question", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("ask-question", input)
		} else {
			next(error)
		}
	}
}

exports.handleFollowingUnfollowing = async (req, res, next) => {
	try {
		const { topicId } = req.body
		const userId = req.user._id

		const user = await User.findById(userId)
		const topic = await Topic.findById(topicId)

		if (user && topic) {
			const isFollowing = user.topicsFollowed.includes(topicId) && topic.usersFollowers.includes(userId)

			if (isFollowing) {
				//unfollow <=> remove the user id from the topic.usersFollowers array and do the same with topic id and user.topicsFollowed

				updatedUser = await User.findByIdAndUpdate(
					userId,
					{
						$pull: { topicsFollowed: topicId }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)

				updatedTopic = await Topic.findByIdAndUpdate(
					topicId,
					{
						$pull: { usersFollowers: userId }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)
			} else {
				//follow

				updatedUser = await User.findByIdAndUpdate(
					userId,
					{
						$push: { topicsFollowed: topicId }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)

				updatedTopic = await Topic.findByIdAndUpdate(
					topicId,
					{
						$push: { usersFollowers: userId }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)
			}

			res.json({
				isFollowing: !isFollowing,
				topic: updatedTopic
			})
		}
	} catch (error) {
		next(error)
	}
}

exports.handleTopicSearch1 = async (req, res, next) => {
	try {
		const topics = await Topic.find()
		res.json(topics)
	} catch (error) {
		next(error)
	}
}

exports.handleTopicSearch2 = async (req, res, next) => {
	let { searchInput } = req.params
	searchInput = searchInput.toLowerCase()

	try {
		const topics = await Topic.find({
			name: {
				$regex: `${searchInput}`
			}
		})
		res.json(topics)
	} catch (error) {
		next(error)
	}
}
