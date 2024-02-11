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
cfbDb.players = require('./player.model')(sequelize, Sequelize);
cfbDb.playerGamePassingStats = require('./playerGamePassingStat.model')(sequelize, Sequelize);

// define associations
// teams
cfbDb.teams.hasMany(cfbDb.schedules, { foreignKey: 'home_team_id', as: 'home_team' });
cfbDb.teams.hasMany(cfbDb.schedules, { foreignKey: 'away_team_id', as: 'away_team' });
cfbDb.teams.hasMany(cfbDb.players, { foreignKey: 'team_id', as: 'players' });
cfbDb.teams.hasMany(cfbDb.playerGamePassingStats, { foreignKey: 'team_id', as: 'player_game_passing_stats' });

// schedules
cfbDb.schedules.belongsTo(cfbDb.teams, { foreignKey: 'home_team_id', as: 'home_team' });
cfbDb.schedules.belongsTo(cfbDb.teams, { foreignKey: 'away_team_id', as: 'away_team' });
cfbDb.schedules.hasMany(cfbDb.playerGamePassingStats, { foreignKey: 'schedule_id', as: 'player_game_passing_stats' });

// players
cfbDb.players.hasMany(cfbDb.playerGamePassingStats, { foreignKey: 'player_id', as: 'player_game_passing_stats' });

// playerGamePassingStats
cfbDb.playerGamePassingStats.belongsTo(cfbDb.schedules, { foreignKey: 'schedule_id', as: 'schedule' });
cfbDb.playerGamePassingStats.belongsTo(cfbDb.players, { foreignKey: 'player_id', as: 'player' });
cfbDb.playerGamePassingStats.belongsTo(cfbDb.teams, { foreignKey: 'team_id', as: 'team' });

module.exports = cfbDb;