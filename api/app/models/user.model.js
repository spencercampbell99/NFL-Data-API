const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The User model.
 */
module.exports = (sequelize, Sequelize) => {
  /**
   * Represents the User model.
   * @class
   * @extends Model
   */
  class User extends Model {
    /**
     * Finds a user by their Stripe customer ID.
     * @param {string} stripeCustomerId - The Stripe customer ID.
     * @returns {Promise<User|null>} The user instance or null if not found.
     */
    static findByStripeCustomerId(stripeCustomerId) {
      return this.findOne({ where: { stripe_customer_id: stripeCustomerId } });
    } 
  }

  // init model
  User.init({
    username: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(100), allowNull: false },
    salt: { type: DataTypes.STRING(200), allowNull: false },
    email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    first_name: { type: DataTypes.STRING(20), allowNull: true },
    last_name: { type: DataTypes.STRING(20), allowNull: true },
    session_token: { type: DataTypes.STRING(40), allowNull: true },
    session_expiration: { type: DataTypes.DATE, allowNull: true },
    stripe_customer_id: { type: DataTypes.STRING(50), allowNull: true },
    access_level: { type: DataTypes.ENUM('free', 'basic'), allowNull: false, defaultValue: 'free', description: 'The access level of the subscription' },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  });

  return User;
};