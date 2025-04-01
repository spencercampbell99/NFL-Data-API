'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const db = {};

let sequelize;

sequelize = new Sequelize(process.env.DB_DATABASE, 'root', process.env.DB_ROOT_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Load other indices if needed
db.nfl = require('./nfl');
db.cfb = require('./cfb');

// Require models with correct naming (singular and uppercase)
db.User = require('./user.model')(sequelize, Sequelize);
db.Permission = require('./permission.model')(sequelize, Sequelize);
db.UserPermission = require('./userPermission')(sequelize, Sequelize);

// Other models (you can keep your previous conventions for unrelated models)
db.Bet = require('./bet.model')(sequelize, Sequelize);
db.BetLeg = require('./betLeg.model')(sequelize, Sequelize);
db.UserPrediction = require('./userPrediction.model')(sequelize, Sequelize);
db.UserSubscription = require('./userSubscription.model')(sequelize, Sequelize);

// Now explicitly call associate after loading all models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// TODO: Move these to model level

// bets associations (keeping your convention here)
db.Bet.belongsTo(db.User, { foreignKey: 'bettor_id', as: 'bettor' });
db.Bet.hasMany(db.BetLeg, { foreignKey: 'bet_id', as: 'legs' });
db.BetLeg.belongsTo(db.Bet, { foreignKey: 'bet_id', as: 'bet' });
db.BetLeg.belongsTo(db.User, { foreignKey: 'bettor_id', as: 'bettor' });
db.BetLeg.belongsTo(db.nfl.schedules, { foreignKey: 'game_id', as: 'game' });
db.BetLeg.belongsTo(db.nfl.teams, { foreignKey: 'team_id', as: 'team' });

// user predictions
db.UserPrediction.belongsTo(db.nfl.schedules, { foreignKey: 'schedule_id', as: 'schedule' });
db.UserPrediction.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// user subscriptions
db.UserSubscription.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

module.exports = db;