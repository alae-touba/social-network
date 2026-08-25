const router = require("express").Router()
const controller = require("../controllers/users.controller")
const { validIdParam } = require("../middleware/validate")

router.param("id", validIdParam)

router.get("/:id", controller.profile)

module.exports = router
