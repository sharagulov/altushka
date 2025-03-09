const multer = require('multer');
const path = require('path');

// Определяем хранилище файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('/var/www/messenger-uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpg|jpeg|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неверный формат файла — только изображения!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
