const Question = require("./../models/question")
const Topic = require("../models/topic")
const User = require("./../models/user")
const Answer = require("./../models/answer")

exports.getQuestionById = async (req, res, next) => {
	const input = {
		title: "question not found",
		connectedUser: req.user
	}

	try {
		const question = await Question.findById(req.params.id)
			.populate("user")
			.populate({
				path: "topic",
				populate: {
					path: "questions",
					match: { _id: { $ne: req.params.id } }
				}
			})
			.populate({
				path: "answers",
				populate: { path: "user" }
			})

		if (question) {
			input.title = question.content
			question.creationDate = new Date(parseInt(question.creationDate)).toDateString()
			input.question = question
			input.answersIds = question.answers.map((answer) => answer._id)
		}

		res.render("question", input)
	} catch (error) {
		if (error.message && error.message.incldues("Cast to ObjectId failed for value")) {
			res.render("question", input)
		} else {
			next(error)
		}
	}
}

exports.getCreateAnswerPage = async (req, res, next) => {
	const input = {
		title: "answer a question",
		connectedUser: req.user
	}

	try {
		const question = await Question.findById(req.params.id)
		if (question) {
			input.question = question
		}
		res.render("write-answer", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("write-answer", input)
		} else {
			next(error)
		}
	}
}

exports.handleCreateAnswer = async (req, res, next) => {
	console.log(req.body)

	const input = {
		title: "write an answer",
		connectedUser: req.user
	}

	try {
		const { answer } = req.body
		const connectedUser = req.user
		const questionId = req.params.id

		const question = await Question.findById(questionId)

		if (question) {
			const newAnswer = await Answer.create({
				content: answer,
				user: connectedUser._id,
				question: questionId
			})

			//add this answer to question's answers as well as user's answers
			const updatedUser = await User.findByIdAndUpdate(
				connectedUser._id,
				{
					$push: { answers: newAnswer._id }
				},
				{
					new: true,
					useFindAndModify: false
				}
			)

			const updatedQuestion = await Question.findByIdAndUpdate(
				questionId,
				{
					$push: { answers: newAnswer._id }
				},
				{
					new: true,
					useFindAndModify: false
				}
			)

			input.question = question
			input.successMessage = "answer successfull created"
		}

		res.render("write-answer", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("write-answer", input)
		} else {
			next(error)
		}
	}
}
