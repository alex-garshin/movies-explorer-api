const jwt = require('jsonwebtoken');
const { AuthError } = require('../errors/AuthError');

const { NODE_ENV, JWT_SECRET } = process.env;
const { JWT_SECRET_DEV } = require('../utils/devConfig');
const { ERROR_MESSAGES } = require('../utils/constants');

module.exports = (req, res, next) => {
  console.log('authorization');
  const { authorization } = req.headers;
  console.log({ authorization });
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new AuthError(ERROR_MESSAGES.UNAUTHORIZED_AUTH));
    return;
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production'
      ? JWT_SECRET : JWT_SECRET_DEV);
  } catch (err) {
    next(new AuthError(ERROR_MESSAGES.UNAUTHORIZED_AUTH));
    return;
  }

  req.user = payload;
  console.log(req.user);

  next();
};
