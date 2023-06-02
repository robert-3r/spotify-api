const Artist = require("../models/artist");
const fs = require("fs");
const path = require("path");
const Album = require("../models/album");
const Song = require("../models/song");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const save = async (req, res) => {
  const params = req.body;

  if (!params.name) {
    return res.status(404).send({
      status: "error",
      message: "falta el campo name",
    });
  }

  try {
    const artist = new Artist(params);

    const artistStored = await artist.save();

    if (!artistStored) {
      return res.status(404).send({
        status: "error",
        message: "Ocurrio un error al crear el artist",
      });
    }
    return res.status(200).send({
      status: "success",
      artistStored,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error del servidor al crear artist",
    });
  }
};

const one = async (req, res) => {
  const idArtist = req.params.id;

  try {
    const artist = await Artist.findById(idArtist);

    if (!artist) {
      return res.status(404).send({
        status: "error",
        message: "No se encontro el artista",
      });
    }

    return res.status(200).send({
      status: "success",
      artist,
    });
  } catch (error) {
    return res.status(500).send({
      status: "success",
      message: "error del servidor al obtener un artist",
    });
  }
};

const list = async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 15,
    sort: { create_at: -1 },
  };

  try {
    const artist = await Artist.paginate({}, options);

    if (!artist || artist.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No se encontraron artistas ",
      });
    }

    return res.status(200).send({
      status: "success",
      artist,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al obtener artistas ",
    });
  }
};

const update = async (req, res) => {
  const idArtist = req.params.id;
  const data = req.body;
  try {
    const artist = await Artist.findByIdAndUpdate(idArtist, data, {
      new: true,
      runValidators: true,
    });

    if (!artist) {
      return res.status(500).send({
        status: "error",
        message: "No se encontro artista a actulizar",
      });
    }

    return res.status(200).send({
      status: "success",
      artist,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al actualizar artista",
    });
  }
};

const remove = async (req, res) => {
  const idArtist = req.params.id;
  const password = req.body.password;

  if (!password) {
    return res.status(400).send({
      status: "error",
      message: "Debes ingresar tu contraseña para poder eliminar el artista",
    });
  }

  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "No se encontró el usuario",
      });
    }

    if (!user.password || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send({
        status: "error",
        message: "Contraseña incorrecta. No se puede eliminar el artista",
      });
    }

    const artist = await Artist.findByIdAndDelete(idArtist);

    if (!artist) {
      return res.status(404).send({
        status: "error",
        message: "No se encontró el artista a eliminar",
      });
    }

    const albumRemoved = await Album.deleteMany({ artist: artist._id });
    const songRemoved = await Song.deleteMany({ artist: idArtist });
    return res.status(200).send({
      status: "success",
      artist,
      albumRemoved,
      songRemoved,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar el artista",
    });
  }
};

const upload = async (req, res) => {
  const idArtist = req.params.id;

  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "La petición no incluye la imagen",
    });
  }

  let image = req.file.originalname;

  const imageSplit = image.split(".");
  const imgExtension = imageSplit[1];

  if (
    imgExtension !== "png" &&
    imgExtension !== "jpg" &&
    imgExtension !== "jpeg" &&
    imgExtension !== "gif"
  ) {
    const filePath = req.file.path;

    fs.unlinkSync(filePath);

    return res.status(400).send({
      status: "error",
      message: "La extensión de archivo no es válida",
    });
  }

  try {
    const artist = await Artist.findById(idArtist);
    if (!artist) {
      return res.status(404).send({
        status: "error",
        message: "Ocurrió un error al encontrar el usuario",
      });
    }

    const previousImage = artist.image;

    if (previousImage) {
      // Verificar si existe el archivo del avatar anterior
      const previousImagePath = path.join(
        __dirname,
        "../uploads/artists",
        previousImage
      );
      if (fs.existsSync(previousImagePath)) {
        fs.unlinkSync(previousImagePath);
      }
    }

    // Actualizar el campo imagen del usuario
    artist.image = req.file.filename;
    await artist.save();

    return res.status(200).send({
      status: "success",
      artist,
      file: req.file,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Ocurrió un error en el servidor al subir la imagen",
    });
  }
};

const image = async (req, res) => {
  const file = req.params.file;

  const filePath = "./uploads/artists/" + file;

  console.log(filePath);

  try {
    fs.stat(filePath, (err, exits) => {
      if (err || !exits) {
        return res.status(404).send({
          status: "error",
          message: "No existe el fichero ",
        });
      }

      return res.sendFile(path.resolve(filePath));
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrio un error el servidor al mostrar avatar",
    });
  }
};

module.exports = {
  save,
  one,
  list,
  update,
  remove,
  upload,
  image,
};
