const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { promisify } = require('util');
require('dotenv').config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});
const storage = multer.diskStorage({
    destination: './public/photos',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

exports.upload = multer({ storage: storage });

/**
 *  promisify method convert a method that return response using callback 
 *  to return a response in a promise object
 */
const removeFileAsync = promisify(fs.unlink);

exports.uploadImg = async (path) => {
    try {
        let res;
        res = await cloudinary.uploader.upload(path);
        await removeFileAsync(path);
        return res.secure_url;
    } catch (error) {
        return error;
    }
};