import multer from "multer";
import path from "path";
import crypto from "crypto"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/userProfile")
    },
    filename: function (req, file, cb) {
        const time = Date.now()
        crypto.randomBytes(6, function (err, bytes) {
            const fn = bytes.toString("hex") + time + path.extname(file.originalname);

            cb(null, fn)
        })
    }
})

export const upload = multer({ storage: storage })
