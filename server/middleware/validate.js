const { body } = require("express-validator")
const { validationResult } = require("express-validator")
const { HttpError, notFound } = require("./errors")

// Covers legacy 24-char hex ids as well as the cuids Prisma generates.
const ID_PATTERN = /^[a-z0-9]{24,25}$/i

/** Route-param middleware: rejects malformed ids with 404 instead of a query error. */
function validIdParam(req, _res, next, value) {
	if (ID_PATTERN.test(value)) {
		next()
	} else {
		next(notFound())
	}
}

/**
 * Runs express-validator chains and turns failures into a single 400 error.
 * The error carries `details` so callers (and clients) see per-field messages.
 */
function validate(chains) {
	return async (req, _res, next) => {
		for (const chain of chains) {
			await chain.run(req)
		}
		const errors = validationResult(req)
		if (errors.isEmpty()) {
			next()
			return
		}
		const error = new HttpError(400, errors.array().map((e) => e.msg).join(" "))
		error.details = errors.array().map((e) => ({ field: e.path, message: e.msg }))
		next(error)
	}
}

const rules = {
	register: [
		body("firstName").trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters."),
		body("lastName").trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters."),
		body("email").isEmail().withMessage("The email is not valid.").normalizeEmail(),
		body("password").isLength({ min: 4 }).withMessage("Password must be at least 4 characters.")
	],
	topic: [
		body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters."),
		body("description").trim().isLength({ min: 20, max: 255 }).withMessage("Description must be between 20 and 255 characters.")
	],
	question: [body("content").trim().isLength({ min: 10 }).withMessage("A question must be at least 10 characters.")],
	answer: [body("content").trim().isLength({ min: 2 }).withMessage("An answer must be at least 2 characters.")]
}

module.exports = { validate, rules, validIdParam }
