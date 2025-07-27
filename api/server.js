const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
require('@dotenvx/dotenvx').config();

// Suppress logs in staging or production
if (['staging', 'production'].includes(process.env.NODE_ENV)) {
  console.log = () => {};
  console.error = () => {};
}

const app = express();
let allowedOrigins = [];
let corsOptions = {};

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
  allowedOrigins = ['*']; // Allow all origins in development or local environments
  corsOptions = {
    origin: '*', // Allow all origins
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
} else {
  allowedOrigins = [
    ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : []),
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : [])
  ];

  corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 204,
};
}

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const db = require('./app/models');
db.sequelize.sync({ alter: false }).then(() => {
  console.log('DB synced');
});

// cfb db
// const cfbDb = require('./app/models/cfb');
// cfbDb.sequelize.sync();

// nfl db
const nflDb = require('./app/models/nfl');
nflDb.sequelize.sync(); // add {alter: true} to alter tables without removing data

const authRequire = require("./app/middleware/auth.middleware").isAuthenticated;

// load routes
require('./app/routes/loaders.routes')(app, authRequire);
require('./app/routes/games.routes')(app, authRequire);
require('./app/routes/teams.routes')(app, authRequire);
require('./app/routes/modelPredictions.routes')(app, authRequire);
require('./app/routes/players.routes')(app, authRequire);
require('./app/routes/auth.routes')(app, authRequire);
require('./app/routes/users.routes')(app, authRequire);
require('./app/routes/bet.routes')(app, authRequire);
require('./app/routes/stripe.routes')(app, authRequire);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the NFL Stats API.' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});