'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const { cfb } = require('..');
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
cfbDb.schedules = require('./schedule.model')(sequelize, Sequelize);

// define associations
// teams
cfbDb.teams.hasMany(cfbDb.schedules, { foreignKey: 'home_team_id', as: 'home_team' });
cfbDb.teams.hasMany(cfbDb.schedules, { foreignKey: 'away_team_id', as: 'away_team' });

// schedules
cfbDb.schedules.belongsTo(cfbDb.teams, { foreignKey: 'home_team_id', as: 'home_team' });
cfbDb.schedules.belongsTo(cfbDb.teams, { foreignKey: 'away_team_id', as: 'away_team' });

module.exports = cfbDb;