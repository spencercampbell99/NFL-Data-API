const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The StripeProduct model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the StripeProduct model.
     * @class
     * @extends Model
     */
    class StripeProduct extends Model {
        
    }

    // init model
    StripeProduct.init({
        'stripe_product_id': { type: DataTypes.STRING, allowNull: false, primaryKey: true },
        'name': { type: DataTypes.STRING, allowNull: false },
        'description': { type: DataTypes.STRING, allowNull: true },
        'created_at': { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    }, {
        sequelize,
        modelName: 'StripeProduct',
        tableName: 'stripe_products',
        timestamps: false,
    });

    return StripeProduct;
};