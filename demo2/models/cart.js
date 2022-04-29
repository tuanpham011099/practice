'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Cart extends Model {
        static associate(models) {
            this.hasMany(models.cartProduct, { foreignKey: 'cartId', as: 'products' });
            this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }
    Cart.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Cart',
    });
    return Cart;
};