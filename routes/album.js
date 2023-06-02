const express = require("express");
const router = express.Router();
const albumController = require("../controllers/album");
const authenticate = require("../middelwares/auth");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/albums");
  },
  filename: (req, file, cb) => {
    cb(null, "album-" + Date.now() + "-" + file.originalname);
  },
});
const uploads = multer({ storage });

router.post("/save", authenticate.auth, albumController.save);
router.get("/one/:id", authenticate.auth, albumController.one);
router.get("/list/:artistId", authenticate.auth, albumController.list);
router.put("/update/:albumId", authenticate.auth, albumController.update);
router.post(
  "/upload/:id",
  [authenticate.auth, uploads.single("file0")],
  albumController.upload
);
router.get("/image/:file", authenticate.auth, albumController.image);
router.delete("/remove/:albumId",authenticate.auth,albumController.remove)


module.exports = router;

