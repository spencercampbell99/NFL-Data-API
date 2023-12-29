const Sequelize = require('sequelize');

// Set up sequelize to point to our MySQL db
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

module.exports = sequelize;