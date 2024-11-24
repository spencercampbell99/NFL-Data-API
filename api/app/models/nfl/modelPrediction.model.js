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

        // betting info
        'suggested_moneyline_percent_bet': { type: DataTypes.FLOAT, allowNull: true },
        'suggested_moneyline_percent_bet_by_score': { type: DataTypes.FLOAT, allowNull: true },

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
        'correct_winner_by_score': { type: DataTypes.BOOLEAN, allowNull: true },
        'correct_spread': { type: DataTypes.BOOLEAN, allowNull: true },
        'correct_over_under': { type: DataTypes.BOOLEAN, allowNull: true },
        'correct_underdog_win': { type: DataTypes.BOOLEAN, allowNull: true }, // correct underdog win, null if not predicted underdog win, false if predicted underdog win but not result
        'correct_underdog_win_by_score': { type: DataTypes.BOOLEAN, allowNull: true },

        // error columns
        'home_team_error': { type: DataTypes.FLOAT, allowNull: true },
        'away_team_error': { type: DataTypes.FLOAT, allowNull: true },
        'total_error': { type: DataTypes.FLOAT, allowNull: true },

        // model names
        'score_model_name': { type: DataTypes.STRING(50), allowNull: true },
        'over_under_model_name': { type: DataTypes.STRING(50), allowNull: true },
        'spread_model_name': { type: DataTypes.STRING(50), allowNull: true },
        'win_model_name': { type: DataTypes.STRING(50), allowNull: true },
    }, {
        sequelize,
        modelName: 'ModelPrediction',
        tableName: 'model_predictions',
        timestamps: false,
    });

    return ModelPrediction;
};