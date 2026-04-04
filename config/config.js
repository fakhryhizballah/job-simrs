require('dotenv').config();
const {
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_HOST,
    DB_DIALECT
} = process.env;

module.exports = {
    "development": {
        "username": DB_USERNAME,
        "password": DB_PASSWORD,
        "database": DB_NAME,
        "host": DB_HOST,
        "dialect": DB_DIALECT,
        "timezone": '+07:00',
        'dialectOptions': {
            'connectTimeout': 30000 // Time in ms (e.g., 30 seconds)
        }
    },
    "test": {
        "username": DB_USERNAME,
        "password": DB_PASSWORD,
        "database": DB_NAME,
        "host": DB_HOST,
        "dialect": DB_DIALECT
    },
    "production": {
        "username": DB_USERNAME,
        "password": DB_PASSWORD,
        "database": DB_NAME,
        "host": DB_HOST,
        "dialect": DB_DIALECT,
        "timezone": '+07:00',
        "logging": false
    }
};
