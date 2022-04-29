const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});
const storage = multer.diskStorage({
    destination: './public/photos',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

exports.upload = multer({ storage: storage });

exports.uploadImg = async(path) => {
    try {
        let res = await cloudinary.uploader.upload(path);
        return res.secure_url;
    } catch (error) {
        return error;
    }
};