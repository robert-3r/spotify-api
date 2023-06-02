const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artist");
const authenticate = require("../middelwares/auth");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/artists");
  },
  filename: (req, file, cb) => {
    cb(null, "artist-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

router.post("/save", authenticate.auth, artistController.save);
router.get("/one/:id", authenticate.auth, artistController.one);
router.get("/list", authenticate.auth, artistController.list);
router.put("/update/:id", authenticate.auth, artistController.update);
router.delete("/remove/:id", authenticate.auth, artistController.remove);
router.post(
  "/upload/:id",
  [authenticate.auth, uploads.single("file0")],
  artistController.upload
);
router.get("/image/:file", authenticate.auth, artistController.image);
module.exports = router;

