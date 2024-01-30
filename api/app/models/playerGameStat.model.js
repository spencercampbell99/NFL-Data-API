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
      static getPassingStatColumns() {
        return [
          'passing_attempts',
          'passing_completions',
          'passing_yards',
          'passing_air_yards',
          'yards_per_pass_attempt',
          'yards_per_pass_completion',
          'passing_touchdowns',
          'passing_interceptions',
          'passing_sacks',
          'passing_sack_yards',
          'passing_sack_fumbles_lost',
          'qb_rating',
          'adjQBR',
          'passer_rating',
          'passing_first_downs',
          'passing_yards_after_catch',
          'passing_epa',
          'passing_2pt_conversions',
          'pacr',
          'dakota',
        ];
      }

      static getRushingStatColumns() {
        return [
          'rushing_attempts',
          'rushing_yards',
          'yards_per_rush_attempt',
          'rushing_touchdowns',
          'rushing_long',
          'rushing_first_downs',
          'rushing_fumbles_lost',
          'rushing_epa',
          'rushing_2pt_conversions',
        ];
      }

      static getReceivingStatColumns() {
        return [
          'receptions',
          'targets',
          'receiving_yards',
          'yards_per_reception',
          'receiving_touchdowns',
          'receiving_long',
          'receiving_first_downs',
          'receiving_fumbles_lost',
          'receiving_epa',
          'receiving_2pt_conversions',
          'receiving_yards_after_catch',
          'receiving_air_yards',
          'racr',
          'target_share',
          'wopr',
          'air_yards_share',
        ];
      }

      static getFumblesStatColumns() {
        return [
          'fumbles',
          'fumbles_lost',
          'fumbles_recovered',
        ];
      }

      static getDefensiveStatColumns() {
        return [
          'tackles',
          'tackles_for_loss',
          'fumbles_forced',
          'sacks',
          'qb_hits',
          'defensive_touchdowns',
          'interceptions',
          'pass_defended',
          'def_fumble_recovery_opp',
          'def_safety_forced',
          'def_penalty',
          'def_penalty_yards',
        ];
      }

      static getKickReturnStatColumns() {
        return [
          'kick_returns',
          'kick_return_yards',
          'yards_per_kick_return',
          'kick_return_touchdowns',
          'kick_return_long',
        ];
      }

      static getPuntStatColumns() {
        return [
          'punts',
          'punt_yards',
          'yards_per_punt',
          'punt_long',
          'punts_inside_20',
          'touchbacks',
        ];
      }

      static getPuntReturnStatColumns() {
        return [
          'punt_returns',
          'punt_return_yards',
          'yards_per_punt_return',
          'punt_return_touchdowns',
          'punt_return_long',
        ];
      }

      static getFieldGoalStatColumns() {
        return [
          'fg_made',
          'fg_missed',
          'fg_blocked',
          'fg_long',
          'fg_att',
          'fg_pct',
          'pat_made',
          'pat_missed',
          'pat_blocked',
          'pat_att',
          'pat_pct',
          'fg_made_distance',
          'fg_missed_distance',
          'gwfg_att',
          'gwfg_made',
          'gwfg_missed',
          'gwfg_blocked',
        ];
      }
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
    fumbles_forced: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    sacks: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    qb_hits: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    defensive_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    interceptions: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    pass_defended: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    def_fumble_recovery_opp: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    def_safety_forced: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    def_penalty: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    def_penalty_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},

    // kick returns
    kick_returns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    kick_return_yards: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    yards_per_kick_return: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    kick_return_touchdowns: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    kick_return_long: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},

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
    fg_made: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    fg_missed: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    fg_blocked: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    fg_long: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    fg_att: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    fg_pct: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    pat_made: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    pat_missed: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    pat_blocked: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    pat_att: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    pat_pct: {type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0},
    fg_made_distance: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    fg_missed_distance: {type: DataTypes.SMALLINT, allowNull: true, defaultValue: 0},
    gwfg_att: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0}, // game winning field goal
    gwfg_made: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    gwfg_missed: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
    gwfg_blocked: {type: DataTypes.TINYINT, allowNull: true, defaultValue: 0},
  }, {
    sequelize,
    modelName: 'playerGameStat',
    tableName: 'player_game_stats',
    timestamps: false,
  });

  return PlayerGameStat;
};