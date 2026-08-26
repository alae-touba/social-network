const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") })

function required(name, fallback) {
	const value = process.env[name] ?? fallback
	if (value === undefined) {
		throw new Error(`Missing required environment variable: ${name}`)
	}
	return value
}

const env = {
	nodeEnv: process.env.NODE_ENV ?? "development",
	port: Number(required("PORT", 3000)),
	databaseUrl: required(
		"DATABASE_URL",
		"postgresql://postgres:secret@localhost:5433/social_network_db?schema=public"
	),
	sessionSecret: required("SESSION_SECRET", "dev-only-insecure-secret"),
	sessionSecureCookie: process.env.SESSION_SECURE_COOKIE === "true",
	spaDir: path.resolve(__dirname, "..", process.env.SPA_DIR ?? "../client/dist/social-network/browser")
}

module.exports = env
