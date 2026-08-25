const router = require("express").Router()
const passport = require("../config/passport")
const controller = require("../controllers/auth.controller")
const { requireAuth } = require("../middleware/auth")
const { validate, rules } = require("../middleware/validate")
const { imageUpload } = require("../middleware/upload")

router.post("/register", imageUpload("users-images"), validate(rules.register), controller.register)
router.post("/login", controller.login)
router.post("/logout", requireAuth, controller.logout)
router.get("/me", controller.getCurrentUser)

module.exports = router
