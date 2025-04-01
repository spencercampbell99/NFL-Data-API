const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  class User extends Model {
    /**
     * Finds a user by their Stripe customer ID.
     * @param {string} stripeCustomerId - The Stripe customer ID.
     * @returns {Promise<User|null>} The user instance or null if not found.
     */
    static findByStripeCustomerId(stripeCustomerId) {
      return this.findOne({ where: { stripe_customer_id: stripeCustomerId } });
    }

    /**
     * Return a list of user's permissions
     * @returns {Promise<Array>} The user's permissions.
     */
    async listUserPermissions() {
      const permissions = await this.getPermissions({
        attributes: ['id', 'name', 'slug', 'description'],
        raw: true, // Ensures only the attributes are returned as plain objects
      });
      return permissions;
    }
  }

  // Initialize the User model
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
    access_level: { type: DataTypes.ENUM('free', 'basic', 'full'), allowNull: false, defaultValue: 'free', description: 'The access level of the subscription' },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  });

  User.associate = (models) => {
    // Define many-to-many relationship between User and Permission
    User.belongsToMany(models.Permission, {
      through: models.UserPermission,
      foreignKey: 'user_id',
      otherKey: 'permission_id',
      as: 'permissions',
    });
  }

  return User;
};