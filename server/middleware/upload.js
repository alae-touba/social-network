const fs = require("fs")
const path = require("path")
const multer = require("multer")
const { HttpError } = require("./errors")

const IMAGES_ROOT = path.join(__dirname, "..", "public", "images")
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE_BYTES = 2 * 1024 * 1024

/**
 * Factory for single-image upload middleware. Files land in the public images
 * folder so they can be served statically, with a generated name and strict
 * type/size limits (the old app accepted any file of any size).
 */
function imageUpload(subfolder) {
	const destination = path.join(IMAGES_ROOT, subfolder)
	fs.mkdirSync(destination, { recursive: true })

	return multer({
		storage: multer.diskStorage({
			destination: (_req, _file, cb) => cb(null, destination),
			filename: (_req, file, cb) => {
				const ext = path.extname(file.originalname).toLowerCase()
				cb(null, `${file.fieldname}-${Date.now()}${ext}`)
			}
		}),
		limits: { fileSize: MAX_SIZE_BYTES },
		fileFilter: (_req, file, cb) => {
			if (!ALLOWED_TYPES.includes(file.mimetype)) {
				cb(new HttpError(400, "Only JPEG, PNG, WebP or GIF images are allowed."))
			} else {
				cb(null, true)
			}
		}
	}).single("image")
}

module.exports = { imageUpload }
