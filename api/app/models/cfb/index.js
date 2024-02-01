'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const cfbDb = {};

let sequelize;

// Set up sequelize to point to our MySQL db
sequelize = new Sequelize(process.env.CFB_DB_DATABASE, 'root', process.env.DB_ROOT_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

cfbDb.sequelize = sequelize;

// require models
cfbDb.teams = require('./team.model')(sequelize, Sequelize);

module.exports = cfbDb;