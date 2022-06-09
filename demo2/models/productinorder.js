'use strict';
const {
    Model
} = require('sequelize');
const { PENDING_PAYMENT } = require('../utils/keyword');
module.exports = (sequelize, DataTypes) => {
    class productInOrder extends Model {
        static associate(models) {
            this.belongsTo(models.Product, { foreignKey: 'productId', as: 'details' });
            this.belongsTo(models.Order, { foreignKey: 'id', as: 'orders' });
        }
    }
    productInOrder.init({
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Product',
                key: 'id'
            }
        },
        orderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Order',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total: {
            type: DataTypes.INTEGER,
        }
    }, {
        sequelize,
        modelName: 'productInOrder',
    });
    return productInOrder;
};