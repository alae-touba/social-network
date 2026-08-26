const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
const prisma = require("./db")

passport.use(
	new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
		try {
			const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
			if (!user || !(await bcrypt.compare(password, user.password))) {
				return done(null, false, { message: "Invalid email or password." })
			}
			return done(null, user)
		} catch (error) {
			return done(error)
		}
	})
)

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
	prisma.user.findUnique({ where: { id } }).then((user) => done(null, user), (error) => done(error))
})

module.exports = passport
