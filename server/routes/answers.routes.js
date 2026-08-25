const router = require("express").Router()
const controller = require("../controllers/questions.controller")
const { requireAuth } = require("../middleware/auth")
const { validIdParam } = require("../middleware/validate")

// Likes belong to answers; the handler lives next to the other answer logic.
router.param("id", validIdParam)

router.post("/:id/like", requireAuth, controller.toggleLike)

module.exports = router
