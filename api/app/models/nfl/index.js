'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const db = {};

let sequelize;

// Set up sequelize to point to our MySQL db
sequelize = new Sequelize(process.env.DB_DATABASE, 'root', process.env.DB_ROOT_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// require models
db.teams = require('./team.model')(sequelize, Sequelize);
db.schedules = require('./schedule.model')(sequelize, Sequelize);
db.boxscores = require('./boxscore.model')(sequelize, Sequelize);
db.players = require('./player.model')(sequelize, Sequelize);
db.playerGameStats = require('./playerGameStat.model')(sequelize, Sequelize);
db.modelPredictions = require('./modelPrediction.model')(sequelize, Sequelize);
db.averagedTeamPerformances = require('./averagedTeamPerformance.model')(sequelize, Sequelize);

// define associations
// teams
db.teams.hasMany(db.schedules, { foreignKey: 'home_team_id', as: 'home_team' });
db.teams.hasMany(db.schedules, { foreignKey: 'away_team_id', as: 'away_team' });
db.teams.hasMany(db.boxscores, { foreignKey: 'team_id' });

// schedules
db.schedules.belongsTo(db.teams, { foreignKey: 'home_team_id', as: 'home_team' });
db.schedules.belongsTo(db.teams, { foreignKey: 'away_team_id', as: 'away_team' });
db.schedules.hasMany(db.boxscores, { foreignKey: 'schedule_id' });
db.schedules.hasMany(db.boxscores, { foreignKey: 'schedule_id', scope: { 'home_team': true }, as: 'home_boxscore' });
db.schedules.hasMany(db.boxscores, { foreignKey: 'schedule_id', scope: { 'home_team': false }, as: 'away_boxscore' });
db.schedules.hasMany(db.playerGameStats, { foreignKey: 'game_id' });

// boxscores
db.boxscores.belongsTo(db.teams, { foreignKey: 'team_id' });
db.boxscores.belongsTo(db.schedules, { foreignKey: 'schedule_id' });

// model predictions
db.modelPredictions.belongsTo(db.schedules, { foreignKey: 'schedule_id', as: 'schedule' });

// averaged team performances
db.averagedTeamPerformances.belongsTo(db.teams, { foreignKey: 'team_id', as: 'team' });
db.averagedTeamPerformances.belongsTo(db.schedules, { foreignKey: 'schedule_id', as: 'schedule' });
db.averagedTeamPerformances.belongsTo(db.boxscores, { foreignKey: 'boxscore_id', as: 'boxscore' });

// player game stats
db.playerGameStats.belongsTo(db.players, { foreignKey: 'player_id', as: 'player' });
db.playerGameStats.belongsTo(db.schedules, { foreignKey: 'game_id' });
db.playerGameStats.belongsTo(db.teams, { foreignKey: 'team_id' });
db.playerGameStats.belongsTo(db.boxscores, { foreignKey: 'boxscore_id' });

module.exports = db;