const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The Player model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the Player model.
   * @class
   * @extends Model
   */
  class Player extends Model {
    
  }

  // init model
  Player.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    team_id: {type: DataTypes.INTEGER, allowNull: true, references: {model: 'teams', key: 'id'}},
    first_name: {type: DataTypes.STRING(45), allowNull: false},
    last_name: {type: DataTypes.STRING(45), allowNull: false},
    full_name: {type: DataTypes.STRING(90), allowNull: false},
    position: {type: DataTypes.STRING(45), allowNull: false},
    number: {type: DataTypes.INTEGER, allowNull: true},
    weight: {type: DataTypes.INTEGER, allowNull: true},
    height: {type: DataTypes.STRING(45), allowNull: true},
    year: {type: DataTypes.STRING(45), allowNull: true},
  }, {
    sequelize,
    modelName: 'player',
    tableName: 'players',
    timestamps: false,
  });

  return Player;
};