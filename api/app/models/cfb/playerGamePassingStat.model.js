const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The PlayerGamePassingStat model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the PlayerGamePassingStat model.
   * @class
   * @extends Model
   */
  class PlayerGamePassingStat extends Model {
    
  }

  // init model
  PlayerGamePassingStat.init({
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    schedule_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'schedules', key: 'id'}},
    player_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'players', key: 'id'}},
    team_id: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'teams', key: 'id'}},
    attempts: {type: DataTypes.INTEGER, allowNull: false},
    completions: {type: DataTypes.INTEGER, allowNull: false},
    yards: {type: DataTypes.INTEGER, allowNull: false},
    touchdowns: {type: DataTypes.INTEGER, allowNull: false},
    interceptions: {type: DataTypes.INTEGER, allowNull: false},
    average_per_attempt: {type: DataTypes.DECIMAL(4, 2), allowNull: false},
    average_per_completion: {type: DataTypes.DECIMAL(4, 2), allowNull: false},
    epa: {type: DataTypes.DECIMAL(4, 2), allowNull: false},
    qbr: {type: DataTypes.DECIMAL(4, 2), allowNull: false}
  }, {
    sequelize,
    modelName: 'playerGamePassingStat',
    tableName: 'player_game_passing_stats',
    timestamps: false,
  });

  return PlayerGamePassingStat;
};