const Album = require("../models/album");
const fs = require("fs");
const path = require("path");
const Song = require("../models/song");

const save = async (req, res) => {
  const params = req.body;

  try {
    const album = new Album(params);

    const albumStored = await album.save();

    if (!albumStored) {
      return res.status(400).send({
        status: "error",
        message: "Ocurrio un error al crear el album",
      });
    }

    return res.status(200).send({
      status: "success",
      albumStored,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrio un error en el servidor al crear el album",
    });
  }
};

const one = async (req, res) => {
  const albumId = req.params.id;

  try {
    const album = await Album.findById(albumId).populate({ path: "artist" });

    if (!album) {
      return res.status(404).send({
        status: "error",
        message: "No se encontro album",
      });
    }

    return res.status(200).send({
      status: "success",
      album,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrio un error en el servidor al obtener el album",
    });
  }
};

const list = async (req, res) => {
  const artistId = req.params.artistId;

  if (!artistId) {
    return res.status(500).send({
      status: "error",
      message: "No se ha encontrado el artista",
    });
  }

  try {
    const album = await Album.find({ artist: artistId }).populate("artist");

    if (album.length === 0) {
      return res.status(500).send({
        status: "error",
        message: "No se encontraron albunes",
      });
    }

    return res.status(200).send({
      status: "success",
      album,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrio un error en el servidor al obtener los albunes",
    });
  }
};

const update = async (req, res) => {
  const albumId = req.params.albumId;
  const data = req.body;

  try {
    const albumUpdate = await Album.findByIdAndUpdate(albumId, data, {
      new: true,
      runValidators: true,
    });

    if (!albumUpdate) {
      return res.status(404).send({
        status: "error",
        message: "No se encontro album a actualizar ",
      });
    }

    return res.status(200).send({
      status: "success",
      album: albumUpdate,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error del servidor al editar el album  ",
    });
  }
};

const upload = async (req, res) => {
  const idAlbum = req.params.id;

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
    const album = await Album.findById({ _id: idAlbum });
    if (!album) {
      return res.status(404).send({
        status: "error",
        message: "Ocurrió un error al encontrar el album",
      });
    }

    const previousImage = album.image;

    if (previousImage) {
      // Verificar si existe el archivo del avatar anterior
      const previousImagePath = path.join(
        __dirname,
        "../uploads/albums",
        previousImage
      );
      if (fs.existsSync(previousImagePath)) {
        fs.unlinkSync(previousImagePath);
      }
    }

    // Actualizar el campo imagen del usuario
    album.image = req.file.filename;
    await album.save();

    return res.status(200).send({
      status: "success",
      album,
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

  const filePath = "./uploads/albums/" + file;

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

const remove = async (req, res) => {
  const albumId = req.params.albumId;

  try {
    const albumRemove = await Album.findOneAndDelete(albumId);
    const songsRemoved = await Song.deleteMany({ album: albumId });

    if (!albumRemove) {
      return res.status(404).send({
        status: "error",
        message: "No se encontro album a eliminar",
      });
    }

    return res.status(200).send({
      status: "success",
      albumRemove,
      songsRemoved,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ha ocurrido un error al eliminar el álbum y las canciones",
    });
  }
};

module.exports = {
  save,
  one,
  list,
  update,
  upload,
  image,
  remove
};
