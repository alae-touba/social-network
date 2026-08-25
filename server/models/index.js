const mongoose = require("mongoose");

/**
 * All schemas use two-way referencing for many-to-many relationships
 * (user <-> topic follows, user <-> answer likes) and one-way references
 * for one-to-many ones (lists of questions/answers are derived by query).
 */
function toJSON(schema) {
	schema.set("toJSON", {
		versionKey: false,
		transform: (_doc, ret) => {
			ret.id = ret._id.toString();
			delete ret._id;
			delete ret.password;
			return ret
		}
	})
}

const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true },
	imageName: { type: String, required: true, default: "default-user.svg" },
	registrationDate: { type: Date, required: true, default: Date.now },
	topicsFollowed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
	answersLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: "Answer" }]
})
toJSON(userSchema)

const topicSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true, trim: true },
	description: { type: String, required: true },
	imageName: { type: String, required: true, default: "default-topic.svg" },
	creationDate: { type: Date, required: true, default: Date.now },
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	usersFollowers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
})
toJSON(topicSchema)

const questionSchema = new mongoose.Schema({
	content: { type: String, required: true },
	creationDate: { type: Date, required: true, default: Date.now },
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true }
})
toJSON(questionSchema)

const answerSchema = new mongoose.Schema({
	content: { type: String, required: true },
	creationDate: { type: Date, required: true, default: Date.now },
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
	usersWhoLike: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
})
toJSON(answerSchema)

module.exports = {
	User: mongoose.model("User", userSchema),
	Topic: mongoose.model("Topic", topicSchema),
	Question: mongoose.model("Question", questionSchema),
	Answer: mongoose.model("Answer", answerSchema)
}
