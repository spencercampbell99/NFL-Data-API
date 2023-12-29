'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

let sequelize;
// Set up sequelize to point to our MySQL db
sequelize = new Sequelize(process.env.DB_DATABASE, 'root', process.env.DB_ROOT_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// require models
db.teams = require('./team.model')(sequelize, Sequelize);
db.schedules = require('./schedule.model')(sequelize, Sequelize);
db.boxscores = require('./boxscore.model')(sequelize, Sequelize);
db.players = require('./player.model')(sequelize, Sequelize);
db.playerGameStats = require('./playerGameStat.model')(sequelize, Sequelize);
db.users = require('./user.model')(sequelize, Sequelize);
db.bets = require('./bet.model')(sequelize, Sequelize);
db.betLegs = require('./betLeg.model')(sequelize, Sequelize);
db.modelPredictions = require('./modelPrediction.model')(sequelize, Sequelize);
db.userPredictions = require('./userPrediction.model')(sequelize, Sequelize);
db.averagedTeamPerformances = require('./averagedTeamPerformance.model')(sequelize, Sequelize);

// // define associations
// // teams
// db.teams.hasMany(db.schedules, { foreignKey: 'home_team_id' }, { as: 'home_team' });
// db.teams.hasMany(db.schedules, { foreignKey: 'away_team_id' }, { as: 'away_team' });
// db.teams.hasMany(db.boxscores, { foreignKey: 'team_id' });

// // schedules
// db.schedules.belongsTo(db.teams, { foreignKey: 'home_team_id' }, { as: 'home_team' });
// db.schedules.belongsTo(db.teams, { foreignKey: 'away_team_id' }, { as: 'away_team' });
// db.schedules.hasMany(db.boxscores, { foreignKey: 'schedule_id' });

// // boxscores
// db.boxscores.belongsTo(db.teams, { foreignKey: 'team_id' });
// db.boxscores.belongsTo(db.schedules, { foreignKey: 'schedule_id' });

// // bets
// db.bets.belongsTo(db.users, { foreignKey: 'bettor_id' }, { as: 'bettor' });
// db.bets.hasMany(db.betLegs, { foreignKey: 'bet_id' });
// db.betLegs.belongsTo(db.bets, { foreignKey: 'bet_id' });
// db.betLegs.belongsTo(db.users, { foreignKey: 'bettor_id' }, { as: 'bettor' });

// // model predictions
// db.modelPredictions.belongsTo(db.schedules, { foreignKey: 'schedule_id' }, { as: 'schedule' });

// // user predictions
// db.userPredictions.belongsTo(db.schedules, { foreignKey: 'schedule_id' }, { as: 'schedule' });
// db.userPredictions.belongsTo(db.users, { foreignKey: 'user_id' }, { as: 'user' });

// // averaged team performances
// db.averagedTeamPerformances.belongsTo(db.teams, { foreignKey: 'team_id' }, { as: 'team' });
// db.averagedTeamPerformances.belongsTo(db.schedules, { foreignKey: 'schedule_id' }, { as: 'schedule' });
// db.averagedTeamPerformances.belongsTo(db.boxscores, { foreignKey: 'boxscore_id' }, { as: 'boxscore' });

module.exports = db;
