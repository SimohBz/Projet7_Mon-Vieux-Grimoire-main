const sharp = require("sharp");
sharp.cache(false);

const fs = require("fs");

const optimizedImg = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Utilise Sharp library pour redimensionner et convertir en webp l'image
    await sharp(req.file.path)
      .resize({
        width: 400,
        height: 500,
      })
      .webp({ quality: 80 })
      .toFile(`${req.file.path.split(".")[0]}optimized.webp`);

    // Supprime l'ancienne image et met à jour le chemin du fichier avec le nouveau nom
    fs.unlink(req.file.path, (error) => {
      req.file.path = `${req.file.path.split(".")[0]}optimized.webp`;

      if (error) {
        console.log(error);
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ error: "L'image n'a pas pu être optimisée" });
  }
};

module.exports = optimizedImg;
