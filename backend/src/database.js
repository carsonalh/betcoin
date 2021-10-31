const mysql = require("mysql2");
const env = require("./env");

const connection = mysql.createConnection({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE_NAME,
  multipleStatements: true,
});

module.exports = connection;
