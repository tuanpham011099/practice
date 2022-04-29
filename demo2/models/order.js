'use strict';
const {
    Model
} = require('sequelize');
const { PENDING_PAYMENT } = require('../utils/keyword');
module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            this.hasMany(models.productInOrder, { foreignKey: 'orderId', as: 'products' })
        }
    }
    Order.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: PENDING_PAYMENT
        },
        payment: {
            type: DataTypes.STRING,
            allowNull: false
        },
        completedDay: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Order',
    });
    return Order;
};