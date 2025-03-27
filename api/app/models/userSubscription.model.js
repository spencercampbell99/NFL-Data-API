const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The UserSubscription model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the UserSubscription model.
     * @class
     * @extends Model
     */
    class UserSubscription extends Model {
        
    }

    // init model
    UserSubscription.init({
        'id': { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        'user_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id', as: 'user' }  },
        'stripe_customer_id': { type: DataTypes.STRING, allowNull: true, description: 'The customer id from stripe' },
        'stripe_subscription_id': { type: DataTypes.STRING, allowNull: false, description: 'The recurring subscription id from stripe' },
        'stripe_latest_invoice_id': { type: DataTypes.STRING, allowNull: false, description: 'The latest invoice id from stripe' },
        'stripe_price_id': { type: DataTypes.STRING, allowNull: false, description: 'The price id from stripe' },
        'is_active': { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, description: 'Is the subscription active' },
        'is_recurring': { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, description: 'Is the subscription recurring' },
        'start_date': { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW, description: 'The date the subscription started' },
        'end_date': { type: DataTypes.DATE, allowNull: true, description: 'The date the subscription ended' },
        'valid_through': { type: DataTypes.DATE, allowNull: true, description: 'The date the subscription is valid through' },
    }, {
        sequelize,
        modelName: 'UserSubscription',
        tableName: 'user_subscriptions',
        timestamps: false,
    });

    return UserSubscription;
};