const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const authenticate = require("../middelwares/auth");

const multer = require("multer");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage });

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", authenticate.auth, userController.profile);
router.patch("/update", authenticate.auth, userController.update);
router.post(
  "/upload",
  [authenticate.auth, uploads.single("file0")],
  userController.upload
);
router.get("/avatar/:file",authenticate.auth,userController.avatar)
module.exports = router;
