const mongoose = require("mongoose")

const questionSchema = mongoose.Schema({
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
		required: true,
		ref: "User"
	},
	topic: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Topic"
	},
	answers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Answer"
		}
	]
})

module.exports = mongoose.model("Question", questionSchema)
