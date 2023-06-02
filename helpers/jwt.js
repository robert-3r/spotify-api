const jwt = require("jwt-simple");
const moment = require("moment");
const SECRET_KEY = require("../services/key");

const createToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, SECRET_KEY);
};

module.exports = { createToken };
