const express = require("express");
const router = express.Router();
const songController = require("../controllers/song");
const authenticate = require("../middelwares/auth");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/songs");
  },
  filename: (req, file, cb) => {
    cb(null, "song-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

router.post("/save", authenticate.auth, songController.save);
router.get("/one/:songId", authenticate.auth, songController.uno);
router.get("/list/:albumId", authenticate.auth, songController.list);
router.put("/update/:songId", authenticate.auth, songController.update);
router.delete("/remove/:songId", authenticate.auth, songController.remove);

router.post(
  "/upload/:id",
  [authenticate.auth, uploads.single("audio0")],
  songController.upload
);
router.get("/audio/:file", authenticate.auth, songController.audio);

module.exports = router;
