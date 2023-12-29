const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The User model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the User model.
   * @class
   * @extends Model
   */
  class User extends Model {
    
  }

  // init model
  User.init({
    username: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(100), allowNull: false },
    salt: { type: DataTypes.STRING(200), allowNull: false },
    email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    first_name: { type: DataTypes.STRING(20), allowNull: true },
    last_name: { type: DataTypes.STRING(20), allowNull: true },
    session_token: { type: DataTypes.STRING(40), allowNull: true },
    session_expiration: { type: DataTypes.DATE, allowNull: true },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  });

  return User;
};