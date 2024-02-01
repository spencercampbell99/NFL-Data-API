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

// load nfl index and cfb index
db.nfl = require('./nfl');
db.cfb = require('./cfb');

// require models
db.users = require('./user.model')(sequelize, Sequelize);
db.bets = require('./bet.model')(sequelize, Sequelize);
db.betLegs = require('./betLeg.model')(sequelize, Sequelize);
db.userPredictions = require('./userPrediction.model')(sequelize, Sequelize);

// bets
db.bets.belongsTo(db.users, { foreignKey: 'bettor_id', as: 'bettor' });
db.bets.hasMany(db.betLegs, { foreignKey: 'bet_id' });
db.betLegs.belongsTo(db.bets, { foreignKey: 'bet_id' });
db.betLegs.belongsTo(db.users, { foreignKey: 'bettor_id', as: 'bettor' });

// user predictions
db.userPredictions.belongsTo(db.nfl.schedules, { foreignKey: 'schedule_id', as: 'schedule' });
db.userPredictions.belongsTo(db.users, { foreignKey: 'user_id', as: 'user' });

module.exports = db;