const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The AveragedTeamPerformance model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the AveragedTeamPerformance model.
     * @class
     * @extends Model
     */
    class AveragedTeamPerformance extends Model {
        
    }

    // init model
    AveragedTeamPerformance.init({
        'schedule_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'schedules', key: 'id', as: 'schedule' } },
        'team_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'teams', key: 'id', as: 'team' } },
        'boxscore_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'box_scores', key: 'id', as: 'boxscore' } },
        'next_schedule_id': { type: DataTypes.INTEGER, allowNull: true, references: { model: 'schedules', key: 'id' } },

        // averages
        'average_points_scored': { type: DataTypes.FLOAT, allowNull: true },
        'average_points_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'average_total_score': { type: DataTypes.FLOAT, allowNull: true },
        'average_punts_inside_20': { type: DataTypes.FLOAT, allowNull: true },
        'average_redzone_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'average_passing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'average_rushing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'average_first_downs': { type: DataTypes.FLOAT, allowNull: true },
        'average_third_down_conversions': { type: DataTypes.FLOAT, allowNull: true },
        'average_yards_per_play': { type: DataTypes.FLOAT, allowNull: true },
        'average_offensive_plays': { type: DataTypes.FLOAT, allowNull: true },
        'average_fg_attempted': { type: DataTypes.FLOAT, allowNull: true },
        'average_epa': { type: DataTypes.FLOAT, allowNull: true },

        // home scoring averages
        'average_home_points_scored': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_points_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_total_score': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_punts_inside_20': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_redzone_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_passing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_rushing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_first_downs': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_third_down_conversions': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_yards_per_play': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_offensive_plays': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_fg_attempted': { type: DataTypes.FLOAT, allowNull: true },
        'average_home_epa': { type: DataTypes.FLOAT, allowNull: true },

        // away scoring averages
        'average_away_points_scored': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_points_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_total_score': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_punts_inside_20': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_redzone_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_passing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_rushing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_first_downs': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_third_down_conversions': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_yards_per_play': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_offensive_plays': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_fg_attempted': { type: DataTypes.FLOAT, allowNull: true },
        'average_away_epa': { type: DataTypes.FLOAT, allowNull: true },

        // averages against opponent
        'average_points_scored_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_points_allowed_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_total_score_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_punts_inside_20_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_redzone_attempts_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_passing_yards_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_rushing_yards_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_first_downs_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_third_down_conversions_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_yards_per_play_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_offensive_plays_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_fg_attempted_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
        'average_epa_against_opponent': { type: DataTypes.FLOAT, allowNull: true },
    }, {
        sequelize,
        modelName: 'AveragedTeamPerformance',
        tableName: 'averaged_team_performances',
        timestamps: false,
    });

    return AveragedTeamPerformance;
};