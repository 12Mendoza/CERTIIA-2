const multer = require('multer');

const TAMANO_MAXIMO = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    'application/pdf'
  ];

  if (!tiposPermitidos.includes(file.mimetype)) {
    return cb(
      new Error('Solo se permiten archivos PDF.'),
      false
    );
  }

  cb(null, true);
};

const uploadDocumento = multer({
  storage,
  limits: {
    fileSize: TAMANO_MAXIMO
  },
  fileFilter
});

module.exports = {
  uploadDocumento,
  TAMANO_MAXIMO
};