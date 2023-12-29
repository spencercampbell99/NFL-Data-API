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
    full_name: {type: DataTypes.STRING(100), allowNull: false},
    first_name: {type: DataTypes.STRING(45), allowNull: false},
    last_name: {type: DataTypes.STRING(45), allowNull: false},
    guid: {type: DataTypes.STRING(45), allowNull: false, unique: true},
    team_id: {type: DataTypes.INTEGER, allowNull: true, references: { model: 'teams', key: 'id' }},
    position: {type: DataTypes.STRING(45), allowNull: true},
    jersey_number: {type: DataTypes.TINYINT, allowNull: true},
    height: {type: DataTypes.STRING(45), allowNull: true},
    weight: {type: DataTypes.TINYINT, allowNull: true},
    college: {type: DataTypes.STRING(100), allowNull: true},
    experience: {type: DataTypes.TINYINT, allowNull: true},
    date_of_birth: {type: DataTypes.DATE, allowNull: true},
    active: {type: DataTypes.BOOLEAN, allowNull: true},
  }, {
    sequelize,
    modelName: 'player',
    tableName: 'players',
    timestamps: false,
  });

  return Player;
};