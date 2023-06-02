const Song = require("../models/song");
const path = require("path");
const fs = require("fs");

const save = async (req, res) => {
  let params = req.body;

  try {
    let song = new Song(params);

    const songStored = await song.save();

    if (!songStored) {
      return res.status(404).send({
        status: "error",
        message: "Ocurrio un error al crear song",
      });
    }

    return res.status(200).send({
      status: "success",
      song: songStored,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "ocurrio en error en el servidor al crear cancion",
    });
  }
};

const uno = async (req, res) => {
  const songId = req.params.songId;

  try {
    const song = await Song.findById(songId).populate("album");

    if (!song) {
      return res.status(404).send({
        status: "error",
        message: "No se encontro la cancion",
      });
    }

    return res.status(200).send({
      status: "success",
      song: song,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrio un error en el servidor al obtener la cancion",
    });
  }
};

const list = async (req, res) => {
  const albumId = req.params.albumId;

  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 30,
    sort: "track",
    populate: {
      path: "album",
      populate: {
        path: "artist",
        model: "Artist",
      },
    },
  };

  try {
    const albumSong = await Song.paginate({ album: albumId }, options);

    // const artist = await Artist.paginate({}, options);

    if (!albumSong || albumSong.length === 0) {
      return res.status(500).send({
        status: "error",
        message: "No se encontraron canciones en este album",
      });
    }

    return res.status(200).send({
      status: "success",
      songs: albumSong,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrio un error en el servidor al obtener la canciones",
    });
  }
};

const update = async (req, res) => {
  const songId = req.params.songId;
  let data = req.body;

  try {
    const songUpdate = await Song.findByIdAndUpdate(songId, data, {
      new: true,
      runValidators: true,
    });
    if (!songUpdate) {
      return res.status(404).send({
        status: "error",
        message: "  No se encontro cancion a actualizar",
      });
    }

    return res.status(200).send({
      status: "success",
      song: songUpdate,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrio un error en el servidor al actualizar canciones",
    });
  }
};

const remove = async (req, res) => {
  const songId = req.params.songId;
  try {
    const song = await Song.findByIdAndDelete({ _id: songId });

    if (!song) {
      return res.status(404).send({
        status: "error",
        message: "  No se encontro cancion a eliminar",
      });
    }
    return res.status(200).send({
      status: "success",
      song: song,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrio un error en el servidor al eliminar cancion",
    });
  }
};

const upload = async (req, res) => {
  const idSong = req.params.id;

  if (!req.file) {
    return res.status(404).send({
      status: "error",
      message: "La petición no incluye el audio",
    });
  }

  let image = req.file.originalname;

  const imageSplit = image.split(".");
  const imgExtension = imageSplit[1];

  if (imgExtension !== "mp3" && imgExtension !== "ogg") {
    const filePath = req.file.path;

    fs.unlinkSync(filePath);

    return res.status(400).send({
      status: "error",
      message: "La extensión de archivo no es válida",
    });
  }

  try {
    const song = await Song.findById({ _id: idSong });
    if (!song) {
      return res.status(404).send({
        status: "error",
        message: "Ocurrió un error al encontrar la cancion",
      });
    }

    const previousImage = song.file;

    if (previousImage) {
      // Verificar si existe el archivo del avatar anterior
      const previousImagePath = path.join(
        __dirname,
        "../uploads/songs",
        previousImage
      );
      if (fs.existsSync(previousImagePath)) {
        fs.unlinkSync(previousImagePath);
      }
    }

    // Actualizar el campo imagen del usuario
    song.file = req.file.filename;
    await song.save();

    return res.status(200).send({
      status: "success",
      song,
      file: req.file,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: "error",
      message: "Ocurrió un error en el servidor al subir el audio",
    });
  }
};

const audio = async (req, res) => {
  const file = req.params.file;

  const filePath = "./uploads/songs/" + file;

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
  uno,
  list,
  update,
  remove,
  upload,
  audio,
};
