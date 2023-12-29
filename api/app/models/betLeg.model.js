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
        'bet_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'bets', key: 'id', as: 'bet' } },
        'name': { type: DataTypes.STRING, allowNull: false },
        'odds': { type: DataTypes.FLOAT, allowNull: false },
        'won': { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
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