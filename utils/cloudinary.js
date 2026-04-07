const cloudinary = require('cloudinary').v2;
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

// Configure Cloudinary ONCE when the server starts
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Make cloudinary available globally or export it
global.cloudinary = cloudinary;
// OR
module.exports = cloudinary;
