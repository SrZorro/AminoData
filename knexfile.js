// Update with your config settings.
require('dotenv').config()

module.exports = {
    development: {
        client: "postgresql",
        connection: {
            database: "amino",
            user: process.env.POSTGRES_USERNAME,
            password: process.env.POSTGRES_PASSWORD
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: "knex_migrations"
        }
    },
};
