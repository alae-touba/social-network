const router = require("express").Router()
const controller = require("../controllers/topics.controller")
const questionController = require("../controllers/questions.controller")
const { requireAuth } = require("../middleware/auth")
const { validate, rules, validIdParam } = require("../middleware/validate")
const { imageUpload } = require("../middleware/upload")

router.param("id", validIdParam)

router.get("/", controller.list)
router.post("/", requireAuth, imageUpload("topics-images"), validate(rules.topic), controller.create)
router.get("/:id", controller.detail)
router.post("/:id/follow", requireAuth, controller.toggleFollow)
router.post("/:id/questions", requireAuth, validate(rules.question), questionController.create)

module.exports = router
