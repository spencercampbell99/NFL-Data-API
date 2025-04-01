const {Model, DataTypes} = require('sequelize');

/**
 * @param {*} sequelize The Sequelize instance.
 * @param {*} Sequelize The Sequelize class.
 * @returns {Model} The UserPermission model.
 */
module.exports = (sequelize, Sequelize) => {
    /**
     * Represents the UserPermission model.
     * @class
     * @extends Model
     */
    class UserPermission extends Model {
        
    }

    // init model
    UserPermission.init({
        'user_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id', as: 'user' } },
        'permission_id': { type: DataTypes.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id', as: 'permission' } },
    }, {
        sequelize,
        modelName: 'UserPermission',
        tableName: 'user_permissions',
        timestamps: false,
    });

    UserPermission.associate = (models) => {
        // Define many-to-many relationship between User and Permission
        UserPermission.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
        UserPermission.belongsTo(models.Permission, {
            foreignKey: 'permission_id',
            as: 'permission',
        });
    }

    return UserPermission;
};