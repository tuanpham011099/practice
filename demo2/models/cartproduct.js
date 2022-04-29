'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class cartProduct extends Model {
        static associate(models) {
            this.belongsTo(models.Product, { foreignKey: 'productId', as: 'details' });
            this.belongsTo(models.Cart, { foreignKey: 'cartId' });
        }
    }
    cartProduct.init({
        cartId: { type: DataTypes.INTEGER, references: { model: 'Cart', key: 'id' } },
        productId: {
            type: DataTypes.INTEGER,
            references: { model: 'Product', key: 'id' }
        },
        quantity: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'cartProduct',
    });
    return cartProduct;
};