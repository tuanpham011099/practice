'use strict';
const { DEFALT_IMG } = require('../utils/keyword')
const {
    Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            this.belongsToMany(models.Product, {
                through: 'categoryProduct',
                as: 'products',
                foreignKey: 'categoryId',
                otherKey: 'productId'
            })
        }
    }
    Category.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        thumbnail: {
            type: DataTypes.STRING,
            defaultValue: DEFALT_IMG
        },
        description: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Category',
    });
    return Category;
};