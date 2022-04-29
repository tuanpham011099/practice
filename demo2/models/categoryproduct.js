'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class categoryProduct extends Model {
        static associate(models) {
            this.belongsTo(models.Category, { foreignKey: 'id' });
            this.belongsTo(models.Product, { foreignKey: 'id' });
        }
    }
    categoryProduct.init({
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Category',
                key: 'id'
            }
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Product',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'categoryProduct',
    });
    return categoryProduct;
};