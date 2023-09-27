const Book = require("../models/Book");
const fs = require("fs");

// Fonction pour creer un livres
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename.split(".")[0]
    }optimized.webp`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour récupérer tous les livres
exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour récupérer un livre
exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename.split(".")[0]
        }optimized.webp`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const isNewImageUploaded = req.file !== undefined;
        if (isNewImageUploaded) {
          const oldImageUrl = book.imageUrl;
          const imageName = oldImageUrl.split("/images/")[1];
          fs.unlink(`images/${imageName}`, () => {
            console.log(`Ancienne image supprimée : ${imageName}`);
          });
        }

        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => {
            res.status(200).json({ message: "Objet modifié!" });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non authorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Fonction pour récupérer les 3 livres les mieux notés
exports.getBestBook = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(401).json({ error }));
};

// Fonction pour noter un livre déja créé
exports.rateBook = async (req, res, next) => {
  const user = req.body.userId;
  if (user !== req.auth.userId) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (book.ratings.find((rating) => rating.userId === user)) {
      return res.status(401).json({ message: "Livre déjà noté" });
    }
    // Création d'un nouvel objet si l'utilisateur n'a pas encore noté ce livre
    const newRating = {
      userId: user,
      grade: req.body.rating,
      _id: req.params._id,
    };

    const updatedRatings = [...book.ratings, newRating];

    // Fonction pour calculer la nouvelle moyenne du livre
    const calcAverageRating = (ratings) => {
      const sumRatings = ratings.reduce((total, rate) => total + rate.grade, 0);
      const average = sumRatings / ratings.length;
      return parseFloat(average.toFixed(2));
    };

    const updateAverageRating = calcAverageRating(updatedRatings);

    // Mise à jour du livre dans la base de donnée
    const updatedBook = await Book.findOneAndUpdate(
      { _id: req.params.id, "ratings.userId": { $ne: user } },
      { $push: { ratings: newRating }, averageRating: updateAverageRating },
      { new: true }
    );

    res.status(201).json(updatedBook);
  } catch (error) {
    res.status(401).json({ error });
  }
};
