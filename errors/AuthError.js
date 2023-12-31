const { STATUS_CODES } = require('../utils/constants');

class AuthError extends Error {
  constructor(message = 'Ошибка 401. Проблема с авторизацией') {
    super(message);
    this.statusCode = STATUS_CODES.UNAUTHORIZED;
  }
}

module.exports = { AuthError };
