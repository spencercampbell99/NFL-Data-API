const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The Bet model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the Bet model.
     * @class
     * @extends Model
     */
    class Bet extends Model {
        
    }

    // init model
    Bet.init({
        'wager': { type: DataTypes.INTEGER, allowNull: false },
        'total_odds': { type: DataTypes.FLOAT, allowNull: false },
        'amount_to_win': { type: DataTypes.INTEGER, allowNull: false },
        'amount_won': { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        'amount_lost': { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        'round_robin_picks': { type: DataTypes.INTEGER, allowNull: true },
        'notional_bet': { type: DataTypes.INTEGER, allowNull: true },
        'bettor_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id', as: 'bettor' }  },
        'type': { type: DataTypes.ENUM('STRAIGHT', 'PARLAY', 'ROUND_ROBIN'), allowNull: false },
        'settled': { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        'settled_at': { type: DataTypes.DATE, allowNull: true },
        'created_at': { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    }, {
        sequelize,
        modelName: 'Bet',
        tableName: 'bets',
        timestamps: false,
    });

    return Bet;
};