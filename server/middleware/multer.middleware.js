import multer from "multer";
import { HttpError } from "../models/http-error.models.js";

const mimeToFormatMap = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/png": "png",
};

export const getUpload = (fileSize = 3) => {
    // fileSize is the size of a file in mb
    const upload = multer({
        limits: {
            fileSize: fileSize * 1000000,
        },
        fileFilter(request, file, cb) {
            if (!mimeToFormatMap[file.mimetype]) {
                cb(
                    new HttpError(
                        "supported file types are .jpeg, .jpg, .png",
                        400
                    )
                );
            }

            cb(null, true);
        },
    });

    return upload;
};
