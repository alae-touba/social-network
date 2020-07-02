const mongoose = require("mongoose")

const answerSchema = mongoose.Schema({
	content: {
		type: String,
		required: true
	},

	creationDate: {
		type: Date,
		required: true,
		default: Date.now
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	usersWhoLike: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
	question: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Question"
	}
})

module.exports = mongoose.model("Answer", answerSchema)
