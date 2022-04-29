'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class productImg extends Model {
        static associate(models) {
            this.belongsTo(models.Product, { foreignKey: 'id' })
        }
    }
    productImg.init({
        href: DataTypes.STRING,
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Product',
                key: 'id'
            }
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'productImg',
    });
    return productImg;
};