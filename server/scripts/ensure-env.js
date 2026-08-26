/**
 * Bootstraps server/.env from server/.env.example so that `npm run db:init`
 * works on a fresh clone without manual steps. Existing .env files are never
 * touched.
 */
const fs = require("fs")
const path = require("path")

const envFile = path.resolve(__dirname, "..", ".env")

if (!fs.existsSync(envFile)) {
	fs.copyFileSync(path.resolve(__dirname, "..", ".env.example"), envFile)
	console.log("Created server/.env from server/.env.example (dev defaults)")
} else {
	console.log("server/.env already exists, keeping your configuration")
}
