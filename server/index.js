const fs = require("fs")
const prisma = require("./config/db")
const env = require("./config/env")
const { createApp } = require("./app")

async function main() {
	await prisma.$connect()
	console.log("Connected to PostgreSQL")

	const app = createApp()
	app.listen(env.port, () => {
		console.log(`Server listening on http://localhost:${env.port} (${env.nodeEnv})`)
		if (!fs.existsSync(env.spaDir)) {
			console.log(`SPA not found at ${env.spaDir} - API only. Build the client or run "ng serve".`)
		}
	})
}

main().catch((error) => {
	console.error("Failed to start server:", error.message)
	process.exit(1)
})
