const User = require("../models/user");
const validate = require("../helpers/validate");
const bcrypt = require("bcryptjs");
const jwt = require("../helpers/jwt");
const fs = require("fs");
const path = require("path");

const register = async (req, res) => {
  const params = req.body;

  if (!params.name || !params.nick || !params.email || !params.password) {
    return res.status(404).send({
      status: "error ",
      message: "Faltan datos por enviar",
    });
  }

  try {
    validate(params);

    const user = await User.find({
      $or: [
        { email: params.email.toLowerCase() },
        { nick: params.nick.toLowerCase() },
      ],
    });

    if (user.length > 0) {
      return res.status(404).send({
        status: "error ",
        message: "el usuario ya existe",
      });
    }

    let pwd = await bcrypt.hash(params.password, 12);
    params.password = pwd;

    let userToSave = new User(params);

    const userStored = await userToSave.save();

    if (!userStored) {
      return res.status(400).send({
        status: "error ",
        message: "Ocurrio un error al registrar usuario",
      });
    }
    const selectedUser = await User.findById(userStored._id).select(
      "-role -password"
    );

    return res.status(200).send({
      status: "success ",
      user: selectedUser,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error ",
      message: "Ocurrio un error en el servidor al registrar usuario",
    });
  }
};

const login = async (req, res) => {
  const params = req.body;

  if (!params.email || !params.password) {
    return res.status(404).send({
      status: "error ",
      message: "Faltan datos por enviar",
    });
  }
  try {
    const emailExits = await User.findOne({ email: params.email }).select(
      " -__v"
    );

    if (!emailExits) {
      return res.status(404).send({
        status: "error ",
        message: "Error no  se encontro usuario a iniciar sesion",
      });
    }

    const pwd = bcrypt.compareSync(params.password, emailExits.password);

    if (!pwd) {
      return res.status(404).send({
        status: "error ",
        message: "credenciales incorrectos",
      });
    }

    let identityUser = emailExits.toObject();
    delete identityUser.password;
    delete identityUser.role;

    const token = jwt.createToken(emailExits);

    return res.status(200).send({
      status: "success ",
      user: identityUser,
      token,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error ",
      message: "Ocurrio un error en el servidor al iniciar session",
    });
  }
};

const profile = async (req, res) => {
  const idUser = req.params.id;

  try {
    const user = await User.findById(idUser);

    if (!user) {
      return res.status(404).send({
        status: "error ",
        message: "Ocurrio un error usuario no encontrado",
      });
    }

    return res.status(200).send({
      status: "success ",
      user,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error ",
      message: "Ocurrio un error en el servidor al obtener datos de el usuario",
    });
  }
};

const update = async (req, res) => {
  let userIdentity = req.user;
  let userToUpdate = req.body;

  try {
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userIdentity.id } }, // Excluir al usuario actual de la búsqueda
        {
          $or: [
            {
              email: userToUpdate.email
                ? userToUpdate.email.toLowerCase()
                : null,
            },
            {
              nick: userToUpdate.nick ? userToUpdate.nick.toLowerCase() : null,
            },
          ],
        },
      ],
    });

    if (existingUser) {
      return res.status(200).send({
        status: "error",
        message: "Prueba con otro email o nick",
      });
    }

    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 12);
      userToUpdate.password = pwd;
    } else {
      delete userToUpdate.password;
    }

    let userUpdate = await User.findByIdAndUpdate(
      { _id: userIdentity.id },
      userToUpdate,
      { new: true, runValidators: true }
    );

    if (!userUpdate) {
      return res.status(404).send({
        status: "error",
        message: "Ocurrió un error al actualizar el usuario",
      });
    }

    return res.status(200).send({
      status: "success",
      userUpdate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      status: "error",
      message: "Ocurrió un error en el servidor al actualizar el usuario",
    });
  }
};

// const upload = async (req, res) => {
//   if (!req.file) {
//     return res.status(404).send({
//       status: "error",
//       message: "La petición no incluye la imagen",
//     });
//   }

//   let image = req.file.originalname;

//   const imageSplit = image.split(".");
//   const imgExtension = imageSplit[1];

//   if (
//     imgExtension !== "png" &&
//     imgExtension !== "jpg" &&
//     imgExtension !== "jpeg" &&
//     imgExtension !== "gif"
//   ) {
//     const filePath = req.file.path;

//     fs.unlinkSync(filePath);

//     return res.status(400).send({
//       status: "error",
//       message: "extension is invalid",
//     });
//   }
//   try {
//     const user = await User.findOneAndUpdate(
//       { _id: req.user.id },
//       { image: req.file.filename },
//       { new: true, runValidators: true }
//     );

//     if (!user) {
//       return res.status(404).send({
//         status: "error",
//         message: "Ocurrio un error al actualizar usuario",
//       });
//     }

//     return res.status(200).send({
//       status: "success",
//       user,
//       file: req.file,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       status: "error",
//       message: "Ocurrio un error en el servidor al subir imagen",
//     });
//   }
// };

const upload = async (req, res) => {
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
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "Ocurrió un error al encontrar el usuario",
      });
    }

    const previousImage = user.image;

    if (previousImage) {
      // Verificar si existe el archivo del avatar anterior
      const previousImagePath = path.join(
        __dirname,
        "../uploads/avatars",
        previousImage
      );
      if (fs.existsSync(previousImagePath)) {
        fs.unlinkSync(previousImagePath);
      }
    }

    // Actualizar el campo imagen del usuario
    user.image = req.file.filename;
    await user.save();

    return res.status(200).send({
      status: "success",
      user,
      file: req.file,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ocurrió un error en el servidor al subir la imagen",
    });
  }
};

const avatar = async (req, res) => {
  const file = req.params.file;

  const filePath = "./uploads/avatars/" + file;

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
  register,
  login,
  profile,
  update,
  upload,
  avatar,
};
