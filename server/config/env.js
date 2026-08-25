const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") })

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
	db: {
		user: required("DB_USER", "root"),
		password: required("DB_PASSWORD", "secret"),
		host: required("DB_HOST", "localhost"),
		port: Number(required("DB_PORT", 27018)),
		name: required("DB_NAME", "social_network_db")
	},
	sessionSecret: required("SESSION_SECRET", "dev-only-insecure-secret"),
	sessionSecureCookie: process.env.SESSION_SECURE_COOKIE === "true",
	spaDir: path.resolve(__dirname, "..", process.env.SPA_DIR ?? "../client/dist/social-network/browser")
}

env.db.uri = `mongodb://${env.db.user}:${env.db.password}@${env.db.host}:${env.db.port}/${env.db.name}?authSource=admin`

module.exports = env
