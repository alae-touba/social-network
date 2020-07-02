const mongoose = require("mongoose")
const User = require("./../models/user")
const passport = require("passport")
const multer = require("multer")
const path = require("path")
const bcrypt = require("bcrypt")
const validator = require("express-validator")

//profile photo upload setup
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "..", "public", "images", "users-images"))
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
	}
})
exports.upload = multer({ storage: storage })

//util functions for passport
exports.findUserByEmail = async (email) => {
	try {
		const user = await User.findOne({ email: email })
		return user
	} catch (error) {
		next(error)
	}
}

exports.findUserById = async (id) => {
	try {
		const user = await User.findById(id)
		return user
	} catch (error) {
		next(error)
	}
}

exports.checkAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		next()
	} else {
		res.redirect("/users/login")
	}
}

exports.checkNotAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		res.redirect("/users")
	} else {
		next()
	}
}

//handling routes functions
exports.getAllUsers = async (req, res, next) => {
	try {
		const users = await User.find()
		res.json(users)
	} catch (error) {
		next(error)
	}
}

exports.getUserById = async (req, res, next) => {
	//the object that will be rendered
	const input = {
		connectedUser: req.user,
		title: "profile page"
	}

	try {
		const id = req.params.id
		const user = await User.findById(id)
			.populate("questions")
			.populate({
				path: "answers",
				populate: { path: "question" }
			})
			.populate("topics")
			.populate("topicsFollowed")

		if (user) {
			input.title = user.firstName + " " + user.lastName
			user.registrationDate = new Date(parseInt(user.registrationDate)).toDateString()
			input.user = user

			if (input.connectedUser) {
				input.isConnectedUserProfile = input.connectedUser._id.toString() === user._id.toString()
			}

			//if we get to this method using this route: /users/:id/:content and not /users/:id
			if (req.params.content) {
				const { content } = req.params
				if (content === "questions") {
					input.questions = true
				} else if (content === "answers") {
					input.answers = true
				} else if (content === "topics") {
					input.topics = true
				} else if (content === "topics-followed") {
					input.topicsFollowed = true
				}
			}
		}
		res.render("profile", input)
	} catch (error) {
		if (error.message && error.message.includes("Cast to ObjectId failed for value")) {
			res.render("profile", input)
		} else {
			next(error)
		}
	}
}

exports.getLoginPage = (req, res, next) => {
	const input = {
		title: "login"
	}
	res.render("login", input)
}

exports.getRegistrationPage = (req, res, next) => {
	const input = {
		title: "register"
	}
	res.render("register", input)
}

exports.validateFormFields = () => {
	return [
		validator
			.check("firstName")
			.notEmpty()
			.withMessage("firstName cannot be empty!")
			.isLength({ min: 2 })
			.withMessage("firstName length must be at least 2 chars!"),

		validator
			.check("lastName")
			.notEmpty()
			.withMessage("lastName cannot be empty!")
			.isLength({ min: 2 })
			.withMessage("lastName length must be at least 2 chars!"),

		validator.check("email").isEmail().withMessage("the email is not valid!"),

		validator.check("password").isLength({ min: 4 }).withMessage("password lenght must be at least 4 chars!")
	]
}

exports.handleRegistration = async (req, res, next) => {
	const input = {
		title: "register"
	}
	try {
		const errors = validator.validationResult(req)

		if (!errors.isEmpty()) {
			res.render("register", { errors: errors.array() })
		} else {
			const { firstName, lastName, email, password } = req.body
			const hashedPassword = await bcrypt.hash(password, 10)

			const newUser = await User.create({
				firstName,
				lastName,
				email,
				password: hashedPassword,
				imageName: req.file ? req.file.filename : "default-user-image.jpg"
			})

			res.render("register", { successMessage: "account successfully created!" })
		}
	} catch (error) {
		next(error)
	}
}

exports.handleLogout = (req, res, next) => {
	req.logOut()
	res.redirect("/topics")
}
