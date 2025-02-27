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

    return UserPermission;
};