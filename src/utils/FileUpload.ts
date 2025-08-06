import multer from "multer";
import path from "path";
import AppError from "../error/AppError";
import httpStatus from "http-status"
import fs from "fs";


export const file_upload_config = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('public', 'images'));
    },
    filename: function (req, file, cb) {
        //original name helps us to get the file extension
        cb(null, Date.now() + "-" + file.originalname);
    },
});

export const image_Upload = multer({
    storage: file_upload_config,
    limits: { fileSize: 1024 * 1024 * 3 /* 3 mb */ },
    fileFilter(req, file, cb) {
        // if file type valid
        if (['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.mimetype)) {
            cb(null, true)
        }
        else {
            cb(null, false);
            return cb(new Error('file type is not allowed'))
        }
    },
});

export const UploadBase64_to_File = (image: string) => {

    if (!image) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'No valid field found',
        );
    }

    // Extract mime type and base64 data
    const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);

    if (!matches) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Invalid base64 image format.',
        );
    }

    const mimeType = matches[1]; // e.g., image/png
    const base64Data = matches[2];
    const extension = mimeType.split("/")[1]; // e.g., png, jpeg
    const filename = `${Date.now()}.${extension}`;
    const savePath = path.join(__dirname, "public", "images", filename);

    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(savePath, buffer);
    return filename;
}