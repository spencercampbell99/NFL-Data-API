const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The BetLeg model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the BetLeg model.
     * @class
     * @extends Model
     */
    class BetLeg extends Model {
        
    }

    // init model
    BetLeg.init({
        'game_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'schedules', key: 'id', as: 'game' } },
        'bet_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'bets', key: 'id', as: 'bet' } },
        'wager': { type: DataTypes.INTEGER, allowNull: true },
        'line_type': { type: DataTypes.ENUM('SPREAD', 'MONEYLINE', 'TOTAL_SCORE'), allowNull: false },
        'team_id': { type: DataTypes.INTEGER, allowNull: true, references: { model: 'teams', key: 'id', as: 'team' } }, // contains team id if line_type is 'MONEYLINE' for example
        'line_value': { type: DataTypes.FLOAT, allowNull: true }, // contains line value. Example if type Spread, value could be 3.5 and if type Total Score, value could be 45.5, to determine settlement
        'over_line': { type: DataTypes.FLOAT, allowNull: true }, // contains over line value. Example if type Total Score, value could be 45.5, to determine settlement
        'odds': { type: DataTypes.FLOAT, allowNull: false },
        'won': { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        'push': { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        'bettor_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id', as: 'bettor' }  },
        'settled': { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        'settled_at': { type: DataTypes.DATE, allowNull: true },
    }, {
        sequelize,
        modelName: 'BetLeg',
        tableName: 'bet_legs',
        timestamps: false,
    });

    return BetLeg;
};