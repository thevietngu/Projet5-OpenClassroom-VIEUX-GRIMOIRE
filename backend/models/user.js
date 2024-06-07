const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Le format de l'adresse e-mail est incorrect",
    },
  },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator, { message: "Cet email est déjà utilisé" });

module.exports = mongoose.model("User", userSchema);
