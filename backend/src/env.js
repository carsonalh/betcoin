module.exports = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER,
  DB_PORT:
    (process.env.DB_PORT && Number.parseInt(process.env.DB_PORT)) || 3306,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE_NAME: process.env.DB_DATABASE_NAME,
};
