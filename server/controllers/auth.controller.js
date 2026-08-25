const bcrypt = require("bcryptjs")
const passport = require("../config/passport")
const { User } = require("../models")
const { fail } = require("../middleware/errors")

function safeUser(user) {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		imageName: user.imageName,
		registrationDate: user.registrationDate
	}
}

/** GET /api/auth/me - current session user, or 204 when anonymous. */
exports.getCurrentUser = (req, res) => {
	if (!req.isAuthenticated()) {
		res.status(204).end()
	} else {
		res.json({ user: safeUser(req.user) })
	}
}

/** POST /api/auth/register */
exports.register = async (req, res, next) => {
	try {
		const { firstName, lastName, email, password } = req.body

		const existing = await User.findOne({ email: email.toLowerCase() })
		if (existing) {
			fail(409, "An account with this email already exists.")
		}

		const user = await User.create({
			firstName,
			lastName,
			email,
			password: await bcrypt.hash(password, 10),
			imageName: req.file ? req.file.filename : "default-user.svg"
		})

		// Log the new user in right away so the SPA can continue seamlessly.
		req.login(user, (error) => {
			if (error) return next(error)
			res.status(201).json({ user: safeUser(user) })
		})
	} catch (error) {
		next(error)
	}
}

/** POST /api/auth/login */
exports.login = (req, res, next) => {
	passport.authenticate("local", (error, user, info) => {
		if (error) return next(error)
		if (!user) return res.status(401).json({ message: info?.message ?? "Invalid email or password." })

		// Regenerate the session before logging in to prevent session fixation.
		req.session.regenerate((regenError) => {
			if (regenError) return next(regenError)
			req.login(user, (loginError) => {
				if (loginError) return next(loginError)
				res.json({ user: safeUser(user) })
			})
		})
	})(req, res, next)
}

/** POST /api/auth/logout */
exports.logout = (req, res, next) => {
	req.logout((error) => {
		if (error) return next(error)
		req.session.destroy(() => {
			res.clearCookie("connect.sid")
			res.status(204).end()
		})
	})
}
