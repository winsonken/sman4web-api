const multer = require('multer');
const fs = require('fs');
const path = require('path');

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/files/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    const fileSize = parseInt(req.headers['content-length']);
    if (fileSize <= 2000000) {
      cb(null, true);
    } else {
      req.fileValidationError = new Error('Ukuran file harus kurang dari 2MB');
      cb(null, false);
    }
  } else {
    req.fileValidationError = new Error('Tipe file harus pdf');
    cb(null, false);
  }
};

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const imageFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    const fileSize = parseInt(req.headers['content-length']);
    if (fileSize <= 2000000) {
      cb(null, true);
    } else {
      req.fileValidationError = new Error('Ukuran foto harus kurang dari 2MB');
      cb(null, false);
    }
  } else {
    req.fileValidationError = new Error('Foto harus bertipe png/jpg/jpeg');
    cb(null, false);
  }
};

const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 2000000 },
  fileFilter: fileFilter,
}).single('file');

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 2000000 },
  fileFilter: imageFilter,
}).single('image');

module.exports = { uploadFile, uploadImage };
