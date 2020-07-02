const mongoose = require("mongoose")

const topicSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String
	},
	imageName: {
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
	questions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Question"
		}
	],
	usersFollowers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	]
})

module.exports = mongoose.model("Topic", topicSchema)
