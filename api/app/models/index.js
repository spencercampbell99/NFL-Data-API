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
db.permissions = require('./permission.model')(sequelize, Sequelize);
db.userPermissions = require('./userPermission')(sequelize, Sequelize);
db.stripeProducts = require('./stripeProduct.model')(sequelize, Sequelize);
db.userSubscriptions = require('./userSubscription.model')(sequelize, Sequelize);

// bets
db.bets.belongsTo(db.users, { foreignKey: 'bettor_id', as: 'bettor' });
db.bets.hasMany(db.betLegs, { foreignKey: 'bet_id', as: 'legs' });
db.betLegs.belongsTo(db.bets, { foreignKey: 'bet_id', as: 'bet' });
db.betLegs.belongsTo(db.users, { foreignKey: 'bettor_id', as: 'bettor' });
db.betLegs.belongsTo(db.nfl.schedules, { foreignKey: 'game_id', as: 'game' });
db.betLegs.belongsTo(db.nfl.teams, { foreignKey: 'team_id', as: 'team' });

// user predictions
db.userPredictions.belongsTo(db.nfl.schedules, { foreignKey: 'schedule_id', as: 'schedule' });
db.userPredictions.belongsTo(db.users, { foreignKey: 'user_id', as: 'user' });

// user permissions
db.userPermissions.belongsTo(db.users, { foreignKey: 'user_id', as: 'user' });
db.userPermissions.belongsTo(db.permissions, { foreignKey: 'permission_id', as: 'permission' });
db.permissions.belongsToMany(db.users, { through: db.userPermissions, foreignKey: 'permission_id', as: 'users' });
db.users.belongsToMany(db.permissions, { through: db.userPermissions, foreignKey: 'user_id', as: 'permissions' });

// user subscriptions
db.userSubscriptions.belongsTo(db.users, { foreignKey: 'user_id', as: 'user' });
db.userSubscriptions.belongsTo(db.stripeProducts, { foreignKey: 'stripe_product_id', as: 'stripe_product' });

module.exports = db;