const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The Schedule model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the Team model.
   * @class
   * @extends Model
   */
  class Schedule extends Model {
    
  }

  // init model
  Schedule.init({
    'id': { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    'season': { type: DataTypes.SMALLINT, allowNull: false },
    'week': { type: DataTypes.TINYINT, allowNull: false },
    'season_type': { type: DataTypes.STRING(20), allowNull: false },
    'game_date': { type: DataTypes.DATE, allowNull: false },
    'game_time': { type: DataTypes.TIME, allowNull: true },
    'completed': { type: DataTypes.BOOLEAN, allowNull: false },
    'neutral_site': { type: DataTypes.BOOLEAN, allowNull: false },
    'conference_game': { type: DataTypes.BOOLEAN, allowNull: false },
    'attendance': { type: DataTypes.INTEGER, allowNull: true },
    'home_team_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'teams', key: 'id', as: 'home_team' } },
    'away_team_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'teams', key: 'id', as: 'away_team' } },
    'home_points': { type: DataTypes.TINYINT, allowNull: true },
    'away_points': { type: DataTypes.TINYINT, allowNull: true },
    'home_pregame_elo': { type: DataTypes.SMALLINT, allowNull: true },
    'away_pregame_elo': { type: DataTypes.SMALLINT, allowNull: true },
    'excitement_index': { type: DataTypes.FLOAT, allowNull: true },

    // betting info
    'provider': { type: DataTypes.STRING(45), allowNull: true },
    'spread': { type: DataTypes.FLOAT, allowNull: true },
    'over_under': { type: DataTypes.FLOAT, allowNull: true },
    'home_moneyline': { type: DataTypes.SMALLINT, allowNull: true },
    'away_moneyline': { type: DataTypes.SMALLINT, allowNull: true },
  }, {
    sequelize,
    modelName: 'schedule',
    tableName: 'schedules',
    timestamps: false,
  });

  return Schedule;
};