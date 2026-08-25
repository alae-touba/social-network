const router = require("express").Router()
const controller = require("../controllers/questions.controller")
const { requireAuth } = require("../middleware/auth")
const { validate, rules, validIdParam } = require("../middleware/validate")

router.param("id", validIdParam)

router.get("/:id", controller.detail)
router.post("/:id/answers", requireAuth, validate(rules.answer), controller.createAnswer)

module.exports = router
