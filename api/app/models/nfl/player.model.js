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
    guid: {type: DataTypes.STRING(45), allowNull: true, unique: true},
    team_id: {type: DataTypes.INTEGER, allowNull: true, references: { model: 'teams', key: 'id' }},
    position: {type: DataTypes.STRING(45), allowNull: true},
    jersey_number: {type: DataTypes.TINYINT, allowNull: true},
    height: {type: DataTypes.SMALLINT, allowNull: true},
    weight: {type: DataTypes.SMALLINT, allowNull: true},
    date_of_birth: {type: DataTypes.DATE, allowNull: true},
    college: {type: DataTypes.STRING(100), allowNull: true},
    experience: {type: DataTypes.TINYINT, allowNull: true},
    rookie_year: {type: DataTypes.SMALLINT, allowNull: true},
    draft_club: {type: DataTypes.STRING(45), allowNull: true},
    draft_number: {type: DataTypes.SMALLINT, allowNull: true},
    active: {type: DataTypes.BOOLEAN, allowNull: true},
    headshot_url: {type: DataTypes.STRING(255), allowNull: true},
    espn_id: {type: DataTypes.INTEGER, allowNull: true},
  }, {
    sequelize,
    modelName: 'player',
    tableName: 'players',
    timestamps: false,
  });

  return Player;
};