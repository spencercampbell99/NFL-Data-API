'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const db = {};

let sequelize;

sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: `${process.env.DB_PORT}`,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
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
db.fantasyPlayerPerformances = require('./fantasyPlayerPerformance.model')(sequelize, Sequelize);
db.leaguePlayerAveragesBySeasons = require('./leaguePlayerAveragesBySeason.model')(sequelize, Sequelize);
db.leagueTeamAveragesBySeasons = require('./leagueTeamAveragesBySeason.model')(sequelize, Sequelize);

// define associations
// teams
db.teams.hasMany(db.schedules, { foreignKey: 'home_team_id', as: 'home_team' });
db.teams.hasMany(db.schedules, { foreignKey: 'away_team_id', as: 'away_team' });
db.teams.hasMany(db.boxscores, { foreignKey: 'team_id' });
db.teams.hasMany(db.playerGameStats, { foreignKey: 'team_id' });
db.teams.hasMany(db.players, { foreignKey: 'team_id' });
db.teams.hasMany(db.averagedTeamPerformances, { foreignKey: 'team_id', as: 'averaged_team_performances' });
db.teams.hasMany(db.leagueTeamAveragesBySeasons, { foreignKey: 'team_id', as: 'league_team_averages_by_seasons' });

// schedules
db.schedules.belongsTo(db.teams, { foreignKey: 'home_team_id', as: 'home_team' });
db.schedules.belongsTo(db.teams, { foreignKey: 'away_team_id', as: 'away_team' });
db.schedules.hasMany(db.boxscores, { foreignKey: 'schedule_id' });
db.schedules.hasMany(db.boxscores, { foreignKey: 'schedule_id', scope: { 'home_team': true }, as: 'home_boxscore' });
db.schedules.hasMany(db.boxscores, { foreignKey: 'schedule_id', scope: { 'home_team': false }, as: 'away_boxscore' });
db.schedules.hasMany(db.playerGameStats, { foreignKey: 'game_id' });
db.schedules.hasMany(db.fantasyPlayerPerformances, { foreignKey: 'schedule_id' });
db.schedules.hasMany(db.modelPredictions, { foreignKey: 'schedule_id', as: 'model_predictions' });

// boxscores
db.boxscores.belongsTo(db.teams, { foreignKey: 'team_id', as: 'team' });
db.boxscores.belongsTo(db.teams, { foreignKey: 'opponent_id', as: 'opponent' });
db.boxscores.belongsTo(db.schedules, { foreignKey: 'schedule_id', as: 'schedule' });
db.boxscores.hasMany(db.playerGameStats, { foreignKey: 'boxscore_id' });

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

// fantasy player performances
db.fantasyPlayerPerformances.belongsTo(db.schedules, { foreignKey: 'schedule_id', as: 'schedule' });
db.fantasyPlayerPerformances.belongsTo(db.players, { foreignKey: 'player_id', as: 'player' });
db.fantasyPlayerPerformances.belongsTo(db.teams, { foreignKey: 'team_id', as: 'team' });

// players
db.players.hasMany(db.playerGameStats, { foreignKey: 'player_id', as: 'game_stats' });
db.players.belongsTo(db.teams, { foreignKey: 'team_id', as: 'team' });

// league team averages by season
db.leagueTeamAveragesBySeasons.belongsTo(db.teams, { foreignKey: 'team_id', as: 'team' });

module.exports = db;