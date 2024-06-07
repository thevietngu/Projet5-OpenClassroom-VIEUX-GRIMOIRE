const Book = require("../models/book");
const fs = require("fs");
const path = require("path");

const sharpConfig = require("../utilities/sharp-config");

const getRatingAverage = require("../utilities/getRatingAverage");
const hasUserAlreadyRated = require("../utilities/hasUserAlreadyRated");

// Création d'un livre  : delete des champs _id et _userid, new Book  avec objet de la requête + nouveau user id + image url de l'image
// optimisé par Sharp

exports.createBook = async (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userID;
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const optimizedImagePath = await sharpConfig.optimizeImage(req.file);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${path.basename(
        optimizedImagePath
      )}`,
    });

    await book.save();
    res.status(201).json({ message: "Livre enregistré !" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
};

// Modification d'un livre  : 
//delete des champs _id et _userid, new Book  avec objet de la requête + nouveau user id + image url de l'image
// optimisé par Sharp
exports.modifyBook = async (req, res, next) => {
  try {
    // Vérifie s'il y a un fichier dans la requête
    // Si oui, crée un bookObject en décomposant les propriétés de l'objet JSON parsé à partir de req.body.book
    // et ajoute une nouvelle propriété imageUrl avec le chemin de l'image téléchargée.
    // Sinon, bookObject est une copie de req.body.
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        }
      : { ...req.body };

    // Supprime la propriété _userId de bookObject pour éviter qu'elle soit modifiée.
    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé !" });
    }
    // Vérifie si l'utilisateur qui a fait la requête est bien l'utilisateur qui a créé le livre.
    // Si ce n'est pas le cas, renvoie une réponse 403 (unauthorized).
    if (book.userId != req.auth.userId) {
      return res.status(403).json({ message: "403: unauthorized request" });
    }
    // Si un fichier est fourni dans la requête, optimise l'image et met à jour l'URL de l'image dans bookObject.
    if (req.file) {
      const optimizedImagePath = await sharpConfig.optimizeImage(req.file);
      bookObject.imageUrl = `${req.protocol}://${req.get("host")}/images/${path.basename(optimizedImagePath)}`;

      // Supprime l'ancienne image du serveur si elle existe.
      const oldImagePath = book.imageUrl.split(`${req.protocol}://${req.get("host")}/images/`)[1];
      if (oldImagePath) {
        fs.unlink(`images/${oldImagePath}`, (err) => {
          if (err) console.log(err);
        });
      }
    }
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: "Objet modifié!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
};


exports.deleteBook = (req, res, next) => {
  // Cherche un livre dans la base de données avec l'ID fourni dans les paramètres de la requête.
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifie si l'utilisateur qui a fait la requête est bien l'utilisateur qui a créé le livre.
      if (book.userId != req.auth.userId) {
        // Si ce n'est pas le cas, renvoie une réponse 401 (non autorisé).
        res.status(401).json({ message: "Non autorisé" });
      } else {
        // Extrait le nom du fichier de l'URL de l'image.
        const filename = book.imageUrl.split("/images/")[1];
        
        // Supprime l'image associée au livre du système de fichiers.
        fs.unlink(`images/${filename}`, () => {
          // Supprime le livre de la base de données.
          Book.deleteOne({ _id: req.params.id })
            .then(() => {  
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => {
              res.status(401).json({ error });
            });
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};


exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};


exports.getBookRatings = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book.ratings))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Get meilleurs livres (limité aux 3 premiers)
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.addRating = (req, res, next) => {
  
  const ratingObject = { ...req.body, grade: req.body.rating };
  delete ratingObject.rating;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur a déjà noté ce livre
      const userRating = hasUserAlreadyRated(req.body.userId, book.ratings);
      if (userRating) {
        res.status(422).json({ message: "Vous avez déjà noté ce livre" });
      } else {
        // Recalculer la note moyenne
        const averageRating = getRatingAverage(book, ratingObject);
        // Ajouter la note à la liste des notes et mettre à jour la note moyenne
        Book.updateOne(
          { _id: req.params.id },
          { $push: { ratings: ratingObject }, averageRating: averageRating }
        )
          .then((book) => {
            // Renvoyer le livre mis à jour
            Book.findOne({ _id: req.params.id }).then((book) =>
              res.status(200).json(book)
            );
          })
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
