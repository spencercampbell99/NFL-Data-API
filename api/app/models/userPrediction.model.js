const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The UserPrediction model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the UserPrediction model.
     * @class
     * @extends Model
     */
    class UserPrediction extends Model {
        
    }

    // init model
    UserPrediction.init({
        'schedule_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'schedules', key: 'id', as: 'schedule' } },
        'home_winner': { type: DataTypes.BOOLEAN, allowNull: true },
        'spread_covered': { type: DataTypes.BOOLEAN, allowNull: true },
        'over_under': { type: DataTypes.ENUM('OVER', 'UNDER'), allowNull: true },
        'notes': { type: DataTypes.STRING, allowNull: true },
        'user_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id', as: 'user' } },
    }, {
        sequelize,
        modelName: 'UserPrediction',
        tableName: 'user_predictions',
        timestamps: false,
    });

    return UserPrediction;
};