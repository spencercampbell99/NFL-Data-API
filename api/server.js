const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
require('dotenv').config();

const app = express();

var corsOptions = {
  origin: '*', // allow all for now
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());
app.use(bodyParser.json());
app.use(cookieParser());

const db = require('./app/models');
db.sequelize.sync();

// cfb db
const cfbDb = require('./app/models/cfb');
cfbDb.sequelize.sync();

// load routes
require('./app/routes/loaders.routes')(app);
require('./app/routes/games.routes')(app);
require('./app/routes/modelPredictions.routes')(app);
require('./app/routes/auth.routes')(app);
require('./app/routes/users.routes')(app);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the NBA Stats API.' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});