const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const { AuthError } = require('../errors/AuthError');
const { ERROR_MESSAGES } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Неверный формат данных',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new AuthError(ERROR_MESSAGES.INCORRECT_DATA),
        );
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(
              new AuthError(ERROR_MESSAGES.INCORRECT_DATA),
            );
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
