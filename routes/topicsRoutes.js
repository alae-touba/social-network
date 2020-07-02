const express = require("express")
const router = express.Router()
const topicsController = require("./../controllers/topicsController")
const usersController = require("./../controllers/usersController")
const Topic = require("../models/topic")

router.get("/", topicsController.getAllTopics)

router.get("/create", usersController.checkAuthenticated, topicsController.getCreateTopicPage)
router.post(
	"/create",
	usersController.checkAuthenticated,
	topicsController.upload.single("image"),
	topicsController.validateTopicFormFields(),
	topicsController.handleCreateTopic
)

router.get("/:id", topicsController.getTopicById)

router.get("/:id/question", usersController.checkAuthenticated, topicsController.getAskQuestionPage)
router.post("/:id/question", usersController.checkAuthenticated, topicsController.validateQuestionFormFields(), topicsController.handleCreateQuestion)

router.post("/follow-unfollow", usersController.checkAuthenticated, topicsController.handleFollowingUnfollowing)

/*
these two routes are for when we want to search a topic by name
in the js script in the topics.hbs file i have a form, and when the user enters something, i will make a GET request to 
	/topics/api/search/entered-value
	
	so there is two scenarios:
		if the text entered by the user is blank (empty string), a GET request will be made to: /topics/api/search/
		if the text entered by the user is not blank,            a GET request will be made to: /topics/api/search/entered-value
*/
router.get("/api/search", topicsController.handleTopicSearch1)
router.get("/api/search/:searchInput", topicsController.handleTopicSearch2)

module.exports = router
