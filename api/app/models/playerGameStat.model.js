const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The PlayerGameStat model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the PlayerGameStat model.
   * @class
   * @extends Model
   */
  class PlayerGameStat extends Model {
    
  }

  // init model
  PlayerGameStat.init({
    player_id: {type: DataTypes.INTEGER, allowNull: false, references: { model: 'players', key: 'id' }},
    game_id: {type: DataTypes.INTEGER, allowNull: false, references: { model: 'schedules', key: 'id' }},
    team_id: {type: DataTypes.INTEGER, allowNull: false, references: { model: 'teams', key: 'id' }},
    boxscore_id: {type: DataTypes.INTEGER, allowNull: true, references: { model: 'box_scores', key: 'id' }},
    position: {type: DataTypes.STRING(3), allowNull: true},
    position_group: {type: DataTypes.STRING(20), allowNull: true},
    season: {type: DataTypes.SMALLINT, allowNull: true},
    week: {type: DataTypes.TINYINT, allowNull: true},

    // passing
    passing_attempts: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    passing_completions: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    passing_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    passing_air_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    yards_per_pass_attempt: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    yards_per_pass_completion: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    passing_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    passing_interceptions: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    passing_sacks: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    passing_sack_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    passing_sack_fumbles_lost: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    qb_rating: {type: DataTypes.DECIMAL(5, 1), allowNull: true, defaultValue: 0},
    adjQBR: {type: DataTypes.DECIMAL(5, 1), allowNull: true, defaultValue: 0},
    passer_rating: {type: DataTypes.DECIMAL(5, 1), allowNull: true, defaultValue: 0},
    passing_first_downs: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    passing_yards_after_catch: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    passing_epa: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},

    // other passing
    passing_2pt_conversions: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    pacr: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    dakota: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},

    // rushing
    rushing_attempts: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    rushing_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    yards_per_rush_attempt: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    rushing_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    rushing_long: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    rushing_first_downs: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    rushing_fumbles_lost: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    rushing_epa: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    rushing_2pt_conversions: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},

    // receiving
    receptions: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    targets: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    receiving_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    yards_per_reception: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    receiving_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    receiving_long: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    receiving_first_downs: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    receiving_fumbles_lost: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    receiving_epa: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    receiving_2pt_conversions: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    receiving_yards_after_catch: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    receiving_air_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    
    // other receiving
    racr: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    target_share: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    wopr: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    air_yards_share: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},

    // total fumbles
    fumbles: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    fumbles_lost: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    fumbles_recovered: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},

    // defense
    tackles: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    tackles_for_loss: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    solo_tackles: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    sacks: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    qb_hits: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    defensive_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    interceptions: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    interception_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    interception_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    passes_defended: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},

    // kicking
    kick_returns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    kick_return_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    yards_per_kick_return: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    kick_return_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    king_return_long: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},

    // punts
    punts: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    punt_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    yards_per_punt: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    punt_long: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    punts_inside_20: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    touchbacks: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},

    // punting returns
    punt_returns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    punt_return_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    yards_per_punt_return: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    punt_return_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    punt_return_long: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},

    // field goal/ep
    field_goal_attempts: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    field_goal_makes: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    field_goal_long: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    field_goal_percentage: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    extra_point_attempts: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    extra_point_makes: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    extra_point_percentage: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    total_kicking_points: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
  }, {
    sequelize,
    modelName: 'playerGameStat',
    tableName: 'player_game_stats',
    timestamps: false,
  });

  return PlayerGameStat;
};