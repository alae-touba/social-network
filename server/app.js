const path = require("path")
const fs = require("fs")
const express = require("express")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const session = require("express-session")
const passport = require("./config/passport")
const env = require("./config/env")

const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/users.routes")
const topicRoutes = require("./routes/topics.routes")
const questionRoutes = require("./routes/questions.routes")
const answerRoutes = require("./routes/answers.routes")
const { notFound } = require("./middleware/errors")

function createApp() {
	const app = express()

	app.disable("x-powered-by")
	// CSP is left to the SPA host; the API only sets the other security headers.
	app.use(helmet({ contentSecurityPolicy: false }))
	if (env.nodeEnv !== "production") {
		app.use(morgan("dev"))
	}
	app.use(express.json())

	const authLimiter = rateLimit({
		windowMs: 15 * 60 * 1000,
		limit: 50,
		standardHeaders: "draft-7",
		legacyHeaders: false
	})

	app.use(
		session({
			secret: env.sessionSecret,
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				sameSite: "lax",
				secure: env.sessionSecureCookie,
				maxAge: 1000 * 60 * 60 * 24 * 7
			}
		})
	)
	app.use(passport.initialize())
	app.use(passport.session())

	// Uploaded & seeded images.
	app.use("/images", express.static(path.join(__dirname, "public", "images"), { maxAge: "1d" }))

	app.use("/api/auth", authLimiter, authRoutes)
	app.use("/api/topics", topicRoutes)
	app.use("/api/questions", questionRoutes)
	app.use("/api/answers", answerRoutes)
	app.use("/api/users", userRoutes)

	// API 404s are JSON; everything else falls through to the SPA.
	app.use("/api", (_req, _res, next) => next(notFound("API route not found.")))

	if (fs.existsSync(env.spaDir)) {
		app.use(express.static(env.spaDir, { maxAge: "1h" }))
		app.use((req, res, next) => {
			if (req.method !== "GET" || req.accepts("html") !== "html") return next()
			res.sendFile(path.join(env.spaDir, "index.html"))
		})
	}

	// eslint-disable-next-line no-unused-vars
	app.use((error, _req, res, _next) => {
		const isDuplicateKey = Number(error.code) === 11000
		const isMulterLimit = typeof error.code === "string" && error.code.startsWith("LIMIT_")
		const status = error.status ?? (isDuplicateKey ? 409 : isMulterLimit ? 400 : 500)
		if (status >= 500) {
			console.error(error)
		}
		res.status(status).json({
			message: status >= 500 && env.nodeEnv === "production" ? "Internal server error." : error.message,
			details: error.details
		})
	})

	return app
}

module.exports = { createApp }
