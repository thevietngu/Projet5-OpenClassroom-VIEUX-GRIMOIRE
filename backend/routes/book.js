const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

// Routes sécurisés
router.post("/", auth, multer, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.addRating);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

//Routes Get
router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.get("/:id/ratings", bookCtrl.getBookRatings);
router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBooks);

module.exports = router;
