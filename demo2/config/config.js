require('dotenv').config();

module.exports = {
    "development": {
        "username": process.env.DB_DEV_USER,
        "password": null,
        "database": process.env.DB_DEV,
        "host": process.env.DB_HOST,
        "dialect": process.env.DB_DIALECT,
        "logging": false
    },
    "test": {
        "username": "root",
        "password": null,
        "database": "database_test",
        "host": "127.0.0.1",
        "dialect": "mysql"
    },
    "production": {
        "username": "root",
        "password": null,
        "database": "database_production",
        "host": "127.0.0.1",
        "dialect": "mysql"
    }
}