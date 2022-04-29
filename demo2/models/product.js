'use strict';
const {
    Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            this.belongsToMany(models.Category, { through: 'categoryProduct', foreignKey: 'productId', as: 'categories', otherKey: 'categoryId' });
            this.hasMany(models.productImg, { foreignKey: 'productId', as: 'images', onDelete: 'cascade' });
        }
    }
    Product.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.STRING,
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Product',
    });
    return Product;
};