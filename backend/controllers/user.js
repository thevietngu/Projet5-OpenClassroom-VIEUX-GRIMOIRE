const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => {
          if (error.errors) {
            if (error.errors.email && error.errors.email.kind === "unique") {
              return res
                .status(400)
                .json({ message: "Cet email est déjà utilisé" });
            }
            if (
              error.errors.email &&
              error.errors.email.kind === "user defined"
            ) {
              return res
                .status(400)
                .json({ message: error.errors.email.message });
            }
          }
          return res
            .status(400)
            .json({ error: error.message || "Une erreur est survenue" });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          const token = jwt.sign(
            { userId: user._id },
            process.env.TOKEN_SECRET,
            { expiresIn: "24h" }
          );
          console.log("Generated Token:", token);
          res.status(200).json({
            userId: user._id,
            token: token,
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
