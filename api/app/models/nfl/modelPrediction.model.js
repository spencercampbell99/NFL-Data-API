const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The ModelPrediction model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the ModelPrediction model.
     * @class
     * @extends Model
     */
    class ModelPrediction extends Model {
        
    }

    // init model
    ModelPrediction.init({
        'schedule_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'schedules', key: 'id', as: 'schedule' } },
        // regressors
        'home_team_score': { type: DataTypes.INTEGER, allowNull: true },
        'away_team_score': { type: DataTypes.INTEGER, allowNull: true },
        'total_score': { type: DataTypes.INTEGER, allowNull: true },

        // classifiers
        'over_under': { type: DataTypes.ENUM('OVER', 'UNDER'), allowNull: true },
        'cover_spread': { type: DataTypes.BOOLEAN, allowNull: true },
        'home_win': { type: DataTypes.BOOLEAN, allowNull: true },
        'underdog_win': { type: DataTypes.BOOLEAN, allowNull: true }, // predicted underdog win

        // are they correct
        'correct_winner': { type: DataTypes.BOOLEAN, allowNull: true },
        'correct_spread': { type: DataTypes.BOOLEAN, allowNull: true },
        'correct_over_under': { type: DataTypes.BOOLEAN, allowNull: true },
        'correct_underdog_win': { type: DataTypes.BOOLEAN, allowNull: true }, // correct underdog win, null if not predicted underdog win, false if predicted underdog win but not result

        // error columns
        'home_team_error': { type: DataTypes.FLOAT, allowNull: true },
        'away_team_error': { type: DataTypes.FLOAT, allowNull: true },
        'total_error': { type: DataTypes.FLOAT, allowNull: true },
    }, {
        sequelize,
        modelName: 'ModelPrediction',
        tableName: 'model_predictions',
        timestamps: false,
    });

    return ModelPrediction;
};