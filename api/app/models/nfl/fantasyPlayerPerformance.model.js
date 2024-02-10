const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The FantasyPlayerPerformance model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the FantasyPlayerPerformance model.
     * @class
     * @extends Model
     */
    class FantasyPlayerPerformance extends Model {
        
    }

    // init model
    FantasyPlayerPerformance.init({
        'schedule_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'schedules', key: 'id', as: 'schedule' } },
        'player_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'players', key: 'id', as: 'player' } },
        'team_id': { type: DataTypes.INTEGER, allowNull: true, references: { model: 'teams', key: 'id', as: 'team' } },
        'season': { type: DataTypes.SMALLINT, allowNull: true },
        'week': { type: DataTypes.TINYINT, allowNull: true },
        'fantasy_points': { type: DataTypes.FLOAT, allowNull: true },
        'ppr': { type: DataTypes.FLOAT, allowNull: true },
    }, {
        sequelize,
        modelName: 'fantasyPlayerPerformance',
        tableName: 'fantasy_player_performances',
        timestamps: false,
    });

    return FantasyPlayerPerformance;
};