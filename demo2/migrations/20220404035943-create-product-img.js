'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('productImgs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            href: Sequelize.STRING,
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            is_default: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('productImgs');
    }
};