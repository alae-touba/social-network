const express = require("express")
const router = express.Router()
const usersController = require("./../controllers/usersController")
const answersController = require("./../controllers/answersController")

router.post("/like-unlike", usersController.checkAuthenticated, answersController.handleLikingUnliking)
module.exports = router
