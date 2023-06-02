const jwt = require("jwt-simple");
const moment = require("moment");
const secret = require("../services/key");

exports.auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).send({
      message: "Falta la cabecera de autentificacion",
    });
  }

  const token = req.headers.authorization.replace(/^Bearer\s*/i, "");

  try {
    let payload = jwt.decode(token, secret);

    if (payload.exp <= moment.unix()) {
      return res.status(401).send({
        status: "error",
        message: "Token is expired",
      });
    }
    req.user = payload;

    next();
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "Token invalido",
    });
  }
};
