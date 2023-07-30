require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { errors } = require('celebrate');

const { PORT, NODE_ENV, MONGO_URL } = require('./utils/constants');
const { MONGO_URL_DEV } = require('./utils/devConfig');
const { limiterConfig } = require('./utils/rateLimiterConfig');
const { handleError } = require('./errors/handleError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes');

const app = express();

const limiter = rateLimit(limiterConfig);

app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use(limiter);
app.use(helmet());

mongoose
  .connect(NODE_ENV === 'production' ? MONGO_URL : MONGO_URL_DEV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch(() => {
    console.log('Database connection error');
  });

app.use(router);

app.use(errorLogger);
app.use(errors());
app.use(handleError);

app.listen(PORT, () => {
  console.log(`App  listening on port ${PORT}`);
});
