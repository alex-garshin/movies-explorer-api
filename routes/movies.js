const moviesRouter = require('express').Router();

const { createMovieValidation, movieIdValidation } = require('../middlewares/validations');

const {
  getAllMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

moviesRouter.get('/', getAllMovies);

moviesRouter.post('/', createMovieValidation, createMovie);

moviesRouter.delete('/:movieId', movieIdValidation, deleteMovie);

module.exports = moviesRouter;
