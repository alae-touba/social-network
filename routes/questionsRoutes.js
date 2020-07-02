const express = require("express")
const router = express.Router()
const usersController = require("./../controllers/usersController")
const questionsController = require("./../controllers/questionsController")

router.get("/:id", questionsController.getQuestionById)

router.get("/:id/answer", usersController.checkAuthenticated, questionsController.getCreateAnswerPage)
router.post("/:id/answer", usersController.checkAuthenticated, questionsController.handleCreateAnswer)

module.exports = router
