const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The Permission model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the Permission model.
     * @class
     * @extends Model
     */
    class Permission extends Model {

    }

    // init model
    Permission.init({
        'id': { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
        'name': { type: DataTypes.STRING, allowNull: false },
        'slug': { type: DataTypes.STRING, allowNull: false },
        'description': { type: DataTypes.STRING, allowNull: true },
    }, {
        sequelize,
        modelName: 'Permission',
        tableName: 'permissions',
        timestamps: false,
    });

    Permission.associate = (models) => {
        // Define many-to-many relationship between User and Permission
        Permission.belongsToMany(models.User, {
            through: models.UserPermission,
            foreignKey: 'permission_id',
            otherKey: 'user_id',
            as: 'users',
        });
    };

    return Permission;
};