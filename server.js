const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const exphbs = require("express-handlebars")
const mongoose = require("mongoose")
const handlebars = require("handlebars")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access")
const { findUserByEmail, findUserById } = require("./controllers/usersController")

const usersRoutes = require("./routes/usersRoutes")
const questionsRoutes = require("./routes/questionsRoutes")
const answersRoutes = require("./routes/answersRoutes")
const topicsRoutes = require("./routes/topicsRoutes")

const app = express()

//database setup
const {
	DB_USER,
	DB_PASSWORD,
	DB_HOST,
	DB_PORT,
	DB_NAME,
} = process.env;

mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})
const db = mongoose.connection
db.on("error", (error) => console.error(error))
db.once("open", () => console.log("Connected to Database " + DB_NAME))

// view engine setup
app.engine(
	".hbs",
	exphbs({
		helpers: {
			//this custom helper will help me see data that i pass from  express to a .hbs view in the js script file
			json: (context) => JSON.stringify(context),
			formatDate: (date) => new Date(parseInt(date)).toDateString(),
			capitalize: (str) =>
				str
					? str
							.split(" ")
							.map((s) => s[0].toUpperCase() + s.slice(1))
							.join(" ")
					: "",
			upperFirstChar: (str) => (str ? str[0].toUpperCase() + str.slice(1) : "")
		},
		extname: ".hbs",
		handlebars: allowInsecurePrototypeAccess(handlebars)
	})
)
app.set("view engine", ".hbs")

//passport setup
const initializePassport = require("./utils/passport-config")
initializePassport(passport, findUserByEmail, findUserById)

//middlwares
if (process.env.NODE_ENV !== "production") {
	app.use(logger("dev"))
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(flash())
app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: false
	})
)

app.use(express.static(path.join(__dirname, "public")))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

// routes
app.use("/users", usersRoutes)
app.use("/questions", questionsRoutes)
app.use("/answers", answersRoutes)
app.use("/topics", topicsRoutes)

app.get("/", (req, res, next) => {
	res.redirect("/topics")
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get("env") === "development" ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render("error")
})

// module.exports = app
const PORT = process.env.PORT || 3000
app.listen(PORT, () =>
	console.log(`app started in mode ${process.env.NODE_ENV},it is listening on port ${PORT}`)
)
