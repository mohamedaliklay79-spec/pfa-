const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dazamog56',
  api_key: '719347255689293',
  api_secret: 'a0TLYvgOrlZjhaVRDgHw-cSdVqQ',
});

module.exports = cloudinary;