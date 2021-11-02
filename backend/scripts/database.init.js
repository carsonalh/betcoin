require("dotenv").config();

const env = require("../src/env");
const fs = require("fs");
const path = require("path");

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  multipleStatements: true,
});

module.exports = connection;

const query =
  `
-- Do not fear SQL injection; this is only a config script and not used at
-- runtime

-- That being said, keep DB_DATABASE_NAME sensible

CREATE DATABASE IF NOT EXISTS ${env.DB_DATABASE_NAME};
USE ${env.DB_DATABASE_NAME};

` + fs.readFileSync(path.resolve(__dirname, "database.init.sql")).toString();

connection.query(query, (err, results, fields) => {
  if (err) {
    console.error("Error initializing the database:");
    console.error(err);
  } else {
    console.info("Initialized the database successfully.");
  }

  process.exit(0);
});
