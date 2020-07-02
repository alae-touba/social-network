const Answer = require("./../models/answer")
const User = require("./../models/user")
const answer = require("./../models/answer")

exports.handleLikingUnliking = async (req, res, next) => {
	try {
		const userId = req.user._id
		const { answerId } = req.body

		console.log(userId)
		console.log(answerId)

		const answer = await Answer.findById(answerId)
		const user = await User.findById(userId)

		if (user && answer) {
			const isLiking = answer.usersWhoLike.includes(userId) && user.answersLiked.includes(answerId)

			let updatedUser = null
			let updatedAnswer = null

			if (isLiking) {
				//unlike
				updatedUser = await User.findByIdAndUpdate(
					userId,
					{
						$pull: { answersLiked: answerId }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)

				updatedAnswer = await Answer.findByIdAndUpdate(
					answerId,
					{
						$pull: { usersWhoLike: userId }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)
			} else {
				updatedUser = await User.findByIdAndUpdate(
					userId,
					{
						$push: { answersLiked: answerId }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)

				updatedAnswer = await Answer.findByIdAndUpdate(
					answerId,
					{
						$push: { usersWhoLike: userId }
					},
					{
						new: true,
						useFindAndModify: false
					}
				)
			}

			res.json({ isLiking: !isLiking, answer: updatedAnswer })
		}
	} catch (error) {
		next(error)
	}
}
