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
    sdv_game_id: {type: DataTypes.INTEGER, allowNull: false, unique: true},
    sdv_game_uid: {type: DataTypes.STRING(45), allowNull: false, unique: true},
    home_team_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'teams', key: 'id', as: 'home_team'}},
    away_team_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'teams', key: 'id', as: 'away_team'}},
    home_team_char_id: {type: DataTypes.STRING(3), allowNull: false},
    away_team_char_id: {type: DataTypes.STRING(3), allowNull: false},
    conference_game: {type: DataTypes.BOOLEAN, allowNull: false},
    short_name: {type: DataTypes.STRING(45), allowNull: false},
    name: {type: DataTypes.STRING(100), allowNull: false},
    location: {type: DataTypes.STRING(45), allowNull: false},
    neutral_site: {type: DataTypes.BOOLEAN, allowNull: false},
    week: {type: DataTypes.TINYINT, allowNull: false},
    season_type: {type: DataTypes.STRING(20), allowNull: false, defaultValue: 'regular-season'},
    season: {type: DataTypes.INTEGER, allowNull: false},
    date: {type: DataTypes.DATE, allowNull: false},
    time: {type: DataTypes.TIME, allowNull: false},
    espn_link: {type: DataTypes.STRING(255), allowNull: false},
    play_by_play_available: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},

    // betting lines
    spread: {type: DataTypes.FLOAT, allowNull: true},
    over_under: {type: DataTypes.FLOAT, allowNull: true},
    home_team_money_line: {type: DataTypes.INTEGER, allowNull: true},
    away_team_money_line: {type: DataTypes.INTEGER, allowNull: true},
  }, {
    sequelize,
    modelName: 'schedule',
    tableName: 'schedules',
    timestamps: false,
  });

  return Schedule;
};