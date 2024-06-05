const Book = require('../models/book');
const fs = require('fs'); 

exports.createBook = async (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book); 
    delete bookObject._id; 
    delete bookObject._userID; 

    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
  

    await book.save();
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred' });
  }
};


exports.modifyBook = (req, res, next) => {
  try {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;

    console.log('Received bookObject:', bookObject);

    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (!book) {
          return res.status(404).json({ message: 'Book not found!' });
        }

        if (book.userId != req.auth.userId) {
          return res.status(401).json({ message: 'Not authorized' });
        }

        console.log('Book found:', book);

        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => {
            console.error('Error updating book:', error);
            res.status(401).json({ error });
          });
      })
      .catch((error) => {
        console.error('Error fetching book:', error);
        res.status(500).json({ error });
      });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred' });
  }
};


exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non autorisé' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Livre supprimé !' });
            })
            .catch((error) => res.status(401).json({ error }));
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

// Obtenir les notes d'un livre :
exports.getBookRatings = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book.ratings))
    .catch((error) => res.status(400).json({ error }));
};

// Obtenir tous les livres :
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Obtenir les 3 meilleurs livres :
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
