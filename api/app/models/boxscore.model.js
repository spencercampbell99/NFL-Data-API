const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The BoxScore model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the BoxScore model.
   * @class
   * @extends Model
   */
  class BoxScore extends Model {

  }

  // init model
  BoxScore.init({
    team_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'teams', key: 'id' } },
    opponent_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'teams', key: 'id' } },
    schedule_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'schedules', key: 'id' } },
    team_char_id: { type: DataTypes.STRING(3), allowNull: false },
    home_team: { type: DataTypes.BOOLEAN, allowNull: false },

    // scoring stats
    points_scored: { type: DataTypes.TINYINT, allowNull: false },
    points_allowed: { type: DataTypes.TINYINT, allowNull: false },

    // downs and conversions
    first_downs: { type: DataTypes.TINYINT, allowNull: false },
    passing_first_downs: { type: DataTypes.TINYINT, allowNull: false },
    rushing_first_downs: { type: DataTypes.TINYINT, allowNull: false },
    penalty_first_downs: { type: DataTypes.TINYINT, allowNull: false },
    third_down_conversions: { type: DataTypes.TINYINT, allowNull: false },
    third_down_attempts: { type: DataTypes.TINYINT, allowNull: false },
    fourth_down_conversions: { type: DataTypes.TINYINT, allowNull: false },
    fourth_down_attempts: { type: DataTypes.TINYINT, allowNull: false },
    red_zone_attempts: { type: DataTypes.TINYINT, allowNull: false },
    red_zone_scores: { type: DataTypes.TINYINT, allowNull: false },

    // total yards and plays
    total_drives: { type: DataTypes.TINYINT, allowNull: false },
    total_offensive_plays: { type: DataTypes.TINYINT, allowNull: false },
    total_offensive_yards: { type: DataTypes.SMALLINT, allowNull: false },
    yards_per_play: { type: DataTypes.DECIMAL(4, 2), allowNull: false },

    // passing
    passing_yards: { type: DataTypes.SMALLINT, allowNull: false },
    passing_attempts: { type: DataTypes.TINYINT, allowNull: false },
    passing_completions: { type: DataTypes.TINYINT, allowNull: false },
    yards_per_pass_attempt: { type: DataTypes.DECIMAL(4, 2), allowNull: false },
    yards_per_pass_completion: { type: DataTypes.DECIMAL(4, 2), allowNull: false },
    interceptions_thrown: { type: DataTypes.TINYINT, allowNull: false },

    // o line/qb
    sacks_allowed: { type: DataTypes.TINYINT, allowNull: false },
    sack_yards_lost: { type: DataTypes.SMALLINT, allowNull: false },

    // rushing
    rushing_yards: { type: DataTypes.SMALLINT, allowNull: false },
    rushing_attempts: { type: DataTypes.TINYINT, allowNull: false },
    yards_per_rush: { type: DataTypes.DECIMAL(4, 2), allowNull: false },

    // penalties
    team_total_penalties: { type: DataTypes.TINYINT, allowNull: false },
    penalty_yards_against: { type: DataTypes.SMALLINT, allowNull: false },

    // offensive errors
    turnovers: { type: DataTypes.TINYINT, allowNull: false },
    fumbles_lost: { type: DataTypes.TINYINT, allowNull: false },

    /**
     * DEFENSE AND SPECIAL TEAMS
     */
    // defense + special teams scoring
    defense_special_teams_tds: { type: DataTypes.TINYINT, allowNull: false },

    // defense stats
    defense_special_teams_interceptions: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_sacks: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_tackles_for_loss: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_passes_defended: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_forced_fumbles: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_fumble_recoveries: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_qb_hits: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_tackles: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_assists: { type: DataTypes.TINYINT, allowNull: true },
    defense_special_teams_safeties: { type: DataTypes.TINYINT, allowNull: true },

    // kicking stats
    field_goals_made: { type: DataTypes.TINYINT, allowNull: true },
    field_goals_attempted: { type: DataTypes.TINYINT, allowNull: true },
    extra_points_made: { type: DataTypes.TINYINT, allowNull: true },
    extra_points_attempted: { type: DataTypes.TINYINT, allowNull: true },
    punts: { type: DataTypes.TINYINT, allowNull: true },
    punt_yards: { type: DataTypes.SMALLINT, allowNull: true },
    yards_per_punt: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    touchbacks: { type: DataTypes.TINYINT, allowNull: true },
    punts_inside_20: { type: DataTypes.TINYINT, allowNull: true },

    // other metadata
    time_of_possession: { type: DataTypes.STRING(6), allowNull: false },
  }, {
    sequelize,
    modelName: 'boxscore',
    tableName: 'box_scores',
    timestamps: false,
  });

  return BoxScore;
};