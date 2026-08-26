/**
 * Polls the database until it accepts connections (the postgres container
 * takes a few seconds on first start). Exits 0 once ready, 1 after ~30s.
 */
const prisma = require("../config/db")

const TIMEOUT_MS = 30000

async function main() {
	const deadline = Date.now() + TIMEOUT_MS
	while (Date.now() < deadline) {
		try {
			await prisma.$queryRaw`SELECT 1`
			console.log("database is ready")
			return
		} catch {
			process.stdout.write(".")
			await new Promise((resolve) => setTimeout(resolve, 1000))
		}
	}
	throw new Error(`database did not become ready within ${TIMEOUT_MS / 1000}s`)
}

main()
	.catch((error) => {
		console.error("\n" + error.message)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
