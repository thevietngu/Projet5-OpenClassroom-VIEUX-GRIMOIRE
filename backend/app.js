// Charge les variables d'environnement depuis le fichier .env
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

// Connexion à la base de données
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(" Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

//permet de récupérer les données envoyées dans le corps d'une requête POST sous forme d'un objet JavaScript accessible via req.body
app.use(bodyParser.json());

// définition Routes pour Book et User
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);


// Configuration Express pour servir des fichiers statiques (ici, les images) à partir du répertoire /images

app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
