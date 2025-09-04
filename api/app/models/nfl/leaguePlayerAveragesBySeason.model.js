const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The LeaguePlayerAveragesBySeason model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the LeaguePlayerAveragesBySeason model.
     * 
     * League averages by position type per game for a season.
     * 
     * @class
     * @extends Model
     */
    class LeaguePlayerAveragesBySeason extends Model {
        
    }

    // init model
    LeaguePlayerAveragesBySeason.init({
        'position': { type: DataTypes.ENUM('QB', 'RB', 'WR', 'TE', 'K', 'LB', 'DB', 'DL', 'RETURNER'), allowNull: false },
        'season': { type: DataTypes.INTEGER, allowNull: false },
        'passing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'air_yards': { type: DataTypes.FLOAT, allowNull: true },
        'passing_yards_after_catch': { type: DataTypes.FLOAT, allowNull: true },
        'passing_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'passing_completions': { type: DataTypes.FLOAT, allowNull: true },
        'passing_touchdowns': { type: DataTypes.FLOAT, allowNull: true },
        'passing_interceptions': { type: DataTypes.FLOAT, allowNull: true },
        'passer_rating': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_yards': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_touchdowns': { type: DataTypes.FLOAT, allowNull: true },
        'targets': { type: DataTypes.FLOAT, allowNull: true },
        'receptions': { type: DataTypes.FLOAT, allowNull: true },
        'receiving_yards': { type: DataTypes.FLOAT, allowNull: true },
        'receiving_yards_after_catch': { type: DataTypes.FLOAT, allowNull: true },
        'receiving_touchdowns': { type: DataTypes.FLOAT, allowNull: true },
        'return_attempts': { type: DataTypes.FLOAT, allowNull: true },
        'return_yards': { type: DataTypes.FLOAT, allowNull: true },
        'return_touchdowns': { type: DataTypes.FLOAT, allowNull: true },

        // yards per stats
        'yards_per_passing_attempt': { type: DataTypes.FLOAT, allowNull: true },
        'yards_per_passing_completion': { type: DataTypes.FLOAT, allowNull: true },
        'air_yards_per_passing_attempt': { type: DataTypes.FLOAT, allowNull: true },
        'air_yards_per_passing_completion': { type: DataTypes.FLOAT, allowNull: true },
        'yards_after_catch_per_reception': { type: DataTypes.FLOAT, allowNull: true },
        'yards_per_rush': { type: DataTypes.FLOAT, allowNull: true },
        'yards_per_reception': { type: DataTypes.FLOAT, allowNull: true },
        'yards_per_target': { type: DataTypes.FLOAT, allowNull: true },
        'yards_per_return': { type: DataTypes.FLOAT, allowNull: true },

        // EPAs
        'passing_epa': { type: DataTypes.FLOAT, allowNull: true },
        'rushing_epa': { type: DataTypes.FLOAT, allowNull: true },
        'receiving_epa': { type: DataTypes.FLOAT, allowNull: true },

        // errors
        'fumbles': { type: DataTypes.FLOAT, allowNull: true },
        'fumbles_lost': { type: DataTypes.FLOAT, allowNull: true },

        // sacks
        'sacks_allowed': { type: DataTypes.FLOAT, allowNull: true },
    }, {
        sequelize,
        modelName: 'LeaguePlayerAveragesBySeason',
        tableName: 'league_player_averages_by_season',
        timestamps: true,
    });

    return LeaguePlayerAveragesBySeason;
};