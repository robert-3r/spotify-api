const validator = require("validator");

const validate = (params) => {
    let resultado = false;
  let name =
    !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: undefined }) &&
    validator.isAlpha(params.name, "es-ES");

  let nick =
    !validator.isEmpty(params.nick) &&
    validator.isLength(params.nick, { min: 3, max: 10 });

  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  let password =
    !validator.isEmpty(params.password) &&
    validator.isLength(params.password, { min: 8, max: 30 });

  if (params.surname) {
    let surname =
      !validator.isEmpty(params.surname) &&
      validator.isLength(params.surname, { min: 3, max: undefined }) &&
      validator.isAlpha(params.surname, "es-ES");

    if (!surname) {
      throw new Error("No se a superado la validacion");
    }
  }

  if (!name || !nick || !password || !email) {
    throw new Error("Validacion sin validar");
  } else {
    resultado = true;
  }

  return resultado;
};

module.exports = validate;
