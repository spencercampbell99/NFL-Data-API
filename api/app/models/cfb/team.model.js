const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The Team model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the Team model.
   * @class
   * @extends Model
   */
  class Team extends Model {
    
  }

  // init model
  Team.init({
    name: {type: DataTypes.STRING(45), allowNull: false},
    short_display_name: {type: DataTypes.STRING(30), allowNull: false},
    char_id: {type: DataTypes.STRING(6), allowNull: false},
    uid: {type: DataTypes.STRING(30), allowNull: true, unique: true},
    location: {type: DataTypes.STRING(45), allowNull: true},
    conference: {type: DataTypes.STRING(45), allowNull: true},
    division: {type: DataTypes.STRING(45), allowNull: true},
    slug: {type: DataTypes.STRING(45), allowNull: true},
    color1: {type: DataTypes.STRING(7), allowNull: true},
    color2: {type: DataTypes.STRING(7), allowNull: true},
    color3: {type: DataTypes.STRING(7), allowNull: true},
    color4: {type: DataTypes.STRING(7), allowNull: true},
    team_logo_wikipedia: {type: DataTypes.STRING(255), allowNull: true},
    team_logo_squared: {type: DataTypes.STRING(255), allowNull: true},
  }, {
    sequelize,
    modelName: 'team',
    tableName: 'teams',
    timestamps: false,
  });

  return Team;
};