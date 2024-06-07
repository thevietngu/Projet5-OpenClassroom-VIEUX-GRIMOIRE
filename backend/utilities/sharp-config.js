const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Définition des types MIME acceptés et leurs extensions correspondantes.
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

async function optimizeImage(file) {
  // Récupère le chemin absolu du fichier téléchargé.
  const absolutePath = path.resolve(file.path);

  // Trouve l'extension du fichier en fonction de son type MIME.
  const extension = MIME_TYPES[file.mimetype];

  // Crée le chemin de destination pour le fichier optimisé en remplaçant l'extension par '.webp'.
  const destinationPath = absolutePath.replace(`.${extension}`, '.webp');

  // Utilise Sharp pour redimensionner et convertir l'image au format WebP.
  await sharp(absolutePath)
    .resize({ width: 800, fit: 'contain' })
    .webp()
    .toFile(destinationPath);

  // Supprime le fichier d'origine.
  fs.unlink(absolutePath, (err) => {
    if (err) console.log(err);
  });

  // Renvoie le nouveau chemin du fichier optimisé.
  return file.path.replace(`.${extension}`, '.webp');
}

// Exportation de la fonction pour utilisation dans d'autres fichiers.
module.exports = { optimizeImage };
