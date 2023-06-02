const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

connection();

const app = express();
const port = 3910;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UserRoutes = require("./routes/user");
const ArtistRoutes = require("./routes/artist");
const AlbumRoutes = require("./routes/album");
const SongRoutes = require("./routes/song");

app.use("/api/user", UserRoutes);
app.use("/api/artist", ArtistRoutes);
app.use("/api/album", AlbumRoutes);
app.use("/api/song", SongRoutes);

app.listen(port, () => {
  console.log("Servidor escuchando en el puerto", port);
});
