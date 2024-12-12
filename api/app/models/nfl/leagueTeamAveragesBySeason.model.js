const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The LeagueTeamAveragesBySeason model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the LeagueTeamAveragesBySeason model.
     * 
     * League averages by team per game for a season.
     * 
     * @class
     * @extends Model
     */
    class LeagueTeamAveragesBySeason extends Model {
        
    }

    // init model
    LeagueTeamAveragesBySeason.init({
        'team_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'teams', key: 'id', as: 'team' } },
        'season': { type: DataTypes.INTEGER, allowNull: false },
        
        // offense
        'points_scored': { type: DataTypes.FLOAT, allowNull: true },
        'total_yards': { type: DataTypes.FLOAT, allowNull: true },
        'passing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'first_downs': { type: DataTypes.FLOAT, allowNull: true },
        'passing_first_downs': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_first_downs': { type: DataTypes.FLOAT, allowNull: true },
        'passing_touchdowns': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_touchdowns': { type: DataTypes.FLOAT, allowNull: true },

        // defense
        'points_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'total_yards_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'passing_yards_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_yards_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'first_downs_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'passing_first_downs_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_first_downs_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'passing_touchdowns_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_touchdowns_allowed': { type: DataTypes.FLOAT, allowNull: true },

        // penalties
        'penalties': { type: DataTypes.FLOAT, allowNull: true },
        'penalty_yards': { type: DataTypes.FLOAT, allowNull: true },
        'penalties_forced': { type: DataTypes.FLOAT, allowNull: true },
        'penalty_yards_forced': { type: DataTypes.FLOAT, allowNull: true },

        // critical conversions
        'third_down_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'third_down_conversions': { type: DataTypes.FLOAT, allowNull: true },
        'fourth_down_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'fourth_down_conversions': { type: DataTypes.FLOAT, allowNull: true },
        'redzone_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'redzone_conversions': { type: DataTypes.FLOAT, allowNull: true },

        // critical conversions allowed
        'third_down_attempts_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'third_down_conversions_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'fourth_down_attempts_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'fourth_down_conversions_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'redzone_attempts_allowed': { type: DataTypes.FLOAT, allowNull: true },
        'redzone_conversions_allowed': { type: DataTypes.FLOAT, allowNull: true },
    }, {
        sequelize,
        modelName: 'LeagueTeamAveragesBySeason',
        tableName: 'league_team_averages_by_season',
        timestamps: true,
    });

    return LeagueTeamAveragesBySeason;
};