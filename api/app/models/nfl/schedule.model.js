const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The Schedule model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the Schedule model.
   * @class
   * @extends Model
   */
  class Schedule extends Model {
    
  }

  // init model
  Schedule.init({
    id: {type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true, autoIncrement: true},
    game_uid: {type: DataTypes.STRING(45), allowNull: false, unique: true},
    home_team_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'teams', key: 'id', as: 'home_team'}},
    away_team_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'teams', key: 'id', as: 'away_team'}},
    home_team_char_id: {type: DataTypes.STRING(3), allowNull: false},
    away_team_char_id: {type: DataTypes.STRING(3), allowNull: false},
    home_score: {type: DataTypes.TINYINT, allowNull: true},
    away_score: {type: DataTypes.TINYINT, allowNull: true},
    total: {type: DataTypes.TINYINT, allowNull: true},
    conference_game: {type: DataTypes.BOOLEAN, allowNull: true},
    division_game: {type: DataTypes.BOOLEAN, allowNull: false},
    neutral_site: {type: DataTypes.BOOLEAN, allowNull: false},
    week: {type: DataTypes.TINYINT, allowNull: false},
    season: {type: DataTypes.INTEGER, allowNull: false},
    game_type: {type: DataTypes.STRING(20), allowNull: false, defaultValue: 'reg'},
    date: {type: DataTypes.DATE, allowNull: false},
    time: {type: DataTypes.TIME, allowNull: false},
    weekday: {type: DataTypes.STRING(9), allowNull: false},
    espn_id: {type: DataTypes.INTEGER, allowNull: true},

    away_rest: {type: DataTypes.TINYINT, allowNull: true},
    home_rest: {type: DataTypes.TINYINT, allowNull: true},

    // stadium info
    roof: {type: DataTypes.STRING(20), allowNull: true},
    surface: {type: DataTypes.STRING(20), allowNull: true},
    temperature: {type: DataTypes.TINYINT, allowNull: true},
    wind: {type: DataTypes.STRING(10), allowNull: true},

    // betting lines
    spread: {type: DataTypes.FLOAT, allowNull: true},
    over_under: {type: DataTypes.FLOAT, allowNull: true},
    home_moneyline: {type: DataTypes.INTEGER, allowNull: true},
    away_moneyline: {type: DataTypes.INTEGER, allowNull: true},
  }, {
    sequelize,
    modelName: 'schedule',
    tableName: 'schedules',
    timestamps: false,
  });

  return Schedule;
};