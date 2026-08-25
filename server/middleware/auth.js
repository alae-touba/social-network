const { fail } = require("./errors")

/** Returns 401 JSON instead of redirecting: the SPA decides where to navigate. */
function requireAuth(req, _res, next) {
	if (req.isAuthenticated()) {
		next()
	} else {
		next(fail(401, "You must be logged in to do that."))
	}
}

module.exports = { requireAuth }
