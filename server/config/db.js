const { PrismaClient } = require("@prisma/client")
const env = require("./env")

/** Single Prisma instance shared by the whole server. */
const prisma = new PrismaClient({
	datasourceUrl: env.databaseUrl
})

module.exports = prisma
