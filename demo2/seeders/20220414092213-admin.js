'use strict';
const bcrypt = require('bcryptjs');
const { formatDay } = require('../utils/validate');
const { ROLE_ADMIN } = require('../utils/keyword');

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('users', [{
            email: 'admin@gmail.com',
            fullName: 'John Doe',
            password: await bcrypt.hash('123456', 10),
            address: 'admin address',
            avatar: 'https://media.istockphoto.com/vectors/user-avatar-profile-icon-black-vector-illustration-website-or-app-ui-vector-id1314335932?k=20&m=1314335932&s=612x612&w=0&h=iE5A7kpl618-ysPrDlFr1-_x4o5zeGXEJMCe3y6WpFM=',
            phone: '0123456789',
            birthDay: formatDay(new Date()),
            gender: 1,
            is_active: 1,
            role: ROLE_ADMIN,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    async down(queryInterface, Sequelize) {
        queryInterface.bulkDelete('users', null, {});
    }
};