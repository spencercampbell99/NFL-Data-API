const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
require('@dotenvx/dotenvx').config();

const app = express();

var corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

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
const cfbDb = require('./app/models/cfb');
cfbDb.sequelize.sync();

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