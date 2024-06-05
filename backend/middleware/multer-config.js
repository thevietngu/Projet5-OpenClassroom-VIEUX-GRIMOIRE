const multer = require("multer");
const fs = require('fs');


const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const dir = 'images';
    
    // Vérifie si le dossier existe
    if (!fs.existsSync(dir)) {
      // Crée le dossier s'il n'existe pas
      fs.mkdirSync(dir, { recursive: true });
    }
    
    callback(null, dir); // Les fichiers seront stockés dans le répertoire "images"
  },
  filename: (req, file, callback) => {
    const extension = MIME_TYPES[file.mimetype];
    const name = file.originalname
      .split(" ")
      .join("_")
      .replace(`.${extension}`, "");
    const fileName = name + Date.now() + "." + extension;
    console.log('Generated filename:', fileName); // Log le nom de fichier généré
    callback(null, fileName);
  },
});

module.exports = multer({ storage: storage }).single("image");
