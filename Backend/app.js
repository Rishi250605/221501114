const express = require('express');
const { loggingMiddleware } = require('./middleware/logger');
const authenticateLogger = require('./auth');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
app.use(express.json());
authenticateLogger();
app.use(loggingMiddleware);
app.use('/', urlRoutes);

module.exports = app;