const router = require('express').Router();
const { signInValidation, signUpValidation } = require('../middlewares/validations');
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { NotFoundError } = require('../errors/NotFoundError');
const { ERROR_MESSAGES } = require('../utils/constants');

const usersRouter = require('./users');
const moviesRouter = require('./movies');

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.post('/signin', signInValidation, login);
router.post('/signup', signUpValidation, createUser);

router.use(auth);
router.use('/users', usersRouter);
router.use('/movies', moviesRouter);

router.use((req, res, next) => {
  next(new NotFoundError(ERROR_MESSAGES.NOT_FOUND_PAGE));
});

module.exports = router;
