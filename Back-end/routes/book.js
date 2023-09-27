const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const optimizedImg = require("../middleware/sharp-config");

const bookCtrl = require("../controllers/book");

// Routes pour obtenir tous les livres, leurs information, creer un nouveau, le midifier et le supprimer
router.get("/", bookCtrl.getAllBook);
router.get("/bestrating", bookCtrl.getBestBook);
router.get("/:id", bookCtrl.getOneBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.post("/", auth, multer, optimizedImg, bookCtrl.createBook);
router.put("/:id", auth, multer, optimizedImg, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
