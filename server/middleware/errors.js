class HttpError extends Error {
	constructor(status, message) {
		super(message)
		this.status = status
	}
}

/** Throwing inside a route lets the central error handler format the response. */
function fail(status, message) {
	throw new HttpError(status, message)
}

function notFound(message = "Not found") {
	return new HttpError(404, message)
}

module.exports = { HttpError, fail, notFound }
