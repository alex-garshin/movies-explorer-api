const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { BadRequestError } = require('../errors/BadRequestError');
const { NotFoundError } = require('../errors/NotFoundError');
const { ConflictError } = require('../errors/ConflictError');

const {
  NODE_ENV, JWT_SECRET, STATUS_CODES, ERROR_MESSAGES,
} = require('../utils/constants');

const { JWT_SECRET_DEV } = require('../utils/devConfig');

console.log(process.env.NODE_ENV);

const createUser = async (req, res, next) => {
  console.log('createUser');
  try {
    const {
      email, password, name,
    } = req.body;
    const passHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: passHash,
      name,
    });
    res.status(STATUS_CODES.CREATED).send({
      _id: user._id,
      email: user.email,
      name: user.name,
    });
    console.log('-successful user creation-');
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError(ERROR_MESSAGES.CONFLICT_USER));
      return;
    }
    if (err.name === 'ValidationError') {
      next(new BadRequestError(ERROR_MESSAGES.BAD_REQUEST_USER));
      return;
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  console.log('login');
  const { email, password } = req.body;
  try {
    const user = await User.findUserByCredentials(email, password);

    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : JWT_SECRET_DEV,
      { expiresIn: '7d' },
    );

    res

      .send({ token, message: 'Успешный вход' });
    console.log('-successful login-');
    return;
  } catch (err) {
    next(err);
  }
};

const getCurrentUser = async (req, res, next) => {
  console.log('getCurrentUser');
  const { _id } = req.user;
  console.log({ _id });
  try {
    const user = await User.findById(_id);
    if (!user) {
      next(new NotFoundError(ERROR_MESSAGES.NOT_FOUND_USER));
      return;
    }
    res.status(STATUS_CODES.OK).send(user);
    console.log('-successful getting of the current user-');
    return;
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  console.log('updateUser');
  const { email, name } = req.body;
  const ownerId = req.user._id;
  try {
    const user = await User.findByIdAndUpdate(
      ownerId,
      { email, name },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!user) {
      next(new NotFoundError(ERROR_MESSAGES.NOT_FOUND_USER));
      return;
    }
    res.status(STATUS_CODES.OK).send(user);
    console.log('-successful update of the current user-');
    return;
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      next(new BadRequestError(ERROR_MESSAGES.BAD_REQUEST_USER));
      return;
    }
    if (err.code === 11000) {
      next(new ConflictError(ERROR_MESSAGES.CONFLICT_USER));
      return;
    }
    next(err);
  }
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUser,
};
