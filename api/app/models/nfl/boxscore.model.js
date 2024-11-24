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
    points_scored: { type: DataTypes.TINYINT, allowNull: true },
    points_allowed: { type: DataTypes.TINYINT, allowNull: true },

    // downs and conversions
    first_downs: { type: DataTypes.TINYINT, allowNull: true },
    passing_first_downs: { type: DataTypes.TINYINT, allowNull: true },
    rushing_first_downs: { type: DataTypes.TINYINT, allowNull: true },
    penalty_first_downs: { type: DataTypes.TINYINT, allowNull: true },
    third_down_conversions: { type: DataTypes.TINYINT, allowNull: true },
    third_down_attempts: { type: DataTypes.TINYINT, allowNull: true },
    fourth_down_conversions: { type: DataTypes.TINYINT, allowNull: true },
    fourth_down_attempts: { type: DataTypes.TINYINT, allowNull: true },
    red_zone_attempts: { type: DataTypes.TINYINT, allowNull: true },
    red_zone_scores: { type: DataTypes.TINYINT, allowNull: true },

    // total yards and plays
    total_drives: { type: DataTypes.TINYINT, allowNull: true },
    total_offensive_plays: { type: DataTypes.TINYINT, allowNull: true },
    total_offensive_yards: { type: DataTypes.SMALLINT, allowNull: true },
    yards_per_play: { type: DataTypes.DECIMAL(4, 2), allowNull: true },

    // passing
    passing_yards: { type: DataTypes.SMALLINT, allowNull: true },
    passing_attempts: { type: DataTypes.TINYINT, allowNull: true },
    passing_completions: { type: DataTypes.TINYINT, allowNull: true },
    yards_per_pass_attempt: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    yards_per_pass_completion: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    interceptions_thrown: { type: DataTypes.TINYINT, allowNull: true },
    passing_epa: { type: DataTypes.DECIMAL(4, 2), allowNull: true },

    // o line/qb
    sacks_allowed: { type: DataTypes.TINYINT, allowNull: true },
    sack_yards_lost: { type: DataTypes.SMALLINT, allowNull: true },
    qb_hits_allowed: { type: DataTypes.TINYINT, allowNull: true },

    // rushing
    rushing_yards: { type: DataTypes.SMALLINT, allowNull: true },
    rushing_attempts: { type: DataTypes.TINYINT, allowNull: true },
    yards_per_rush: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    rushing_epa: { type: DataTypes.DECIMAL(4, 2), allowNull: true },

    receiving_epa: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    total_epa: { type: DataTypes.DECIMAL(4, 2), allowNull: true },

    // penalties
    team_total_penalties: { type: DataTypes.TINYINT, allowNull: true },
    penalty_yards_against: { type: DataTypes.SMALLINT, allowNull: true },

    // offensive errors
    turnovers: { type: DataTypes.TINYINT, allowNull: true },
    fumbles_lost: { type: DataTypes.TINYINT, allowNull: true },

    /**
     * DEFENSE AND SPECIAL TEAMS
     */
    // defense + special teams scoring
    defense_special_teams_tds: { type: DataTypes.TINYINT, allowNull: true },

    // defense stats
    defense_interceptions: { type: DataTypes.TINYINT, allowNull: true },
    defense_sacks: { type: DataTypes.TINYINT, allowNull: true },
    defense_tackles_for_loss: { type: DataTypes.TINYINT, allowNull: true },
    defense_passes_defended: { type: DataTypes.TINYINT, allowNull: true },
    defense_forced_fumbles: { type: DataTypes.TINYINT, allowNull: true },
    defense_fumble_recoveries: { type: DataTypes.TINYINT, allowNull: true },
    defense_qb_hits: { type: DataTypes.TINYINT, allowNull: true },
    defense_tackles: { type: DataTypes.TINYINT, allowNull: true },
    defense_assists: { type: DataTypes.TINYINT, allowNull: true },
    defense_safeties: { type: DataTypes.TINYINT, allowNull: true },
    pass_defended_allowed: { type: DataTypes.TINYINT, allowNull: true },

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
    time_of_possession: { type: DataTypes.STRING(6), allowNull: true },

    // power scores
    rolling_offense_power_score: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    rolling_defense_power_score: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
  }, {
    sequelize,
    modelName: 'boxscore',
    tableName: 'box_scores',
    timestamps: false,
  });

  return BoxScore;
};