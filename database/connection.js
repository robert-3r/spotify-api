const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1/app_music");

    console.log("Connectado correctamente a la base de datos");
  } catch (error) {
    console.log("Ocurrio un error al conectar con la base de datos", error);
    throw error;
  }
};

module.exports = connection;
