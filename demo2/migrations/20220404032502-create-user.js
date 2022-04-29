'use strict';

const { DEFALT_IMG, ROLE_USER } = require("../utils/keyword");

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            fullName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false
            },
            avatar: {
                type: Sequelize.STRING,
                defaultValue: DEFALT_IMG
            },
            phone: {
                type: Sequelize.STRING
            },
            birthDay: {
                type: Sequelize.DATE
            },
            gender: Sequelize.BOOLEAN,
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            role: {
                type: Sequelize.STRING,
                defaultValue: ROLE_USER
            },
            is_ban: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            rs: {
                type: Sequelize.STRING
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
        await queryInterface.dropTable('Users');
    }
};