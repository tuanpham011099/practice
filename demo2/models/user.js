'use strict';
const { DEFALT_IMG, ROLE_USER } = require('../utils/keyword')
const {
    Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            this.hasMany(models.Order, { foreignKey: 'id', onDelete: 'cascade', as: 'orders' });
            this.hasMany(models.Cart, { foreignKey: 'userId', onDelete: 'cascade', as: 'cart' });
        }
    }
    User.init({
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        avatar: {
            type: DataTypes.STRING,
            defaultValue: DEFALT_IMG
        },
        phone: {
            type: DataTypes.TEXT
        },
        birthDay: {
            type: DataTypes.DATE
        },
        gender: DataTypes.BOOLEAN,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: ROLE_USER
        },
        is_ban: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        rs: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};