const express = require("express")
const router = express.Router()
const User = require("./../models/user")
const usersController = require("./../controllers/usersController")
const passport = require("passport")

router.get("/", usersController.getAllUsers)
router.get("/login", usersController.checkNotAuthenticated, usersController.getLoginPage)
router.get("/register", usersController.checkNotAuthenticated, usersController.getRegistrationPage)
router.get("/:id", usersController.getUserById)
router.get("/:id/:content", usersController.getUserById)

router.post(
	"/login",
	usersController.checkNotAuthenticated,
	passport.authenticate("local", {
		successRedirect: "/topics",
		failureRedirect: "/users/login",
		failureFlash: true
	})
)
router.post(
	"/register",
	usersController.checkNotAuthenticated,
	usersController.upload.single("image"),
	usersController.validateFormFields(),
	usersController.handleRegistration
)

router.delete("/logout", usersController.checkAuthenticated, usersController.handleLogout)

module.exports = router
