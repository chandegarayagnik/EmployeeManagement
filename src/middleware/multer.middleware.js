import fs from "fs";
import multer from "multer";
import path from "path"

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        // await fs.mkdirSync(`./media/${req.params.Master}`, {recursive : true})
        cb(null, `./media`)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

export const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 * 1024 }  // 1GB
}).fields([
    { name: 'empphoto', maxCount: 100 }
]);