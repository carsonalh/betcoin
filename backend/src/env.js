module.exports = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER,
  DB_PORT:
    (process.env.DB_PORT && Number.parseInt(process.env.DB_PORT)) || 3306,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE_NAME: process.env.DB_DATABASE_NAME,
  JWT_SECRET: process.env.JWT_SECRET || "SECRET",
  JWT_TOKEN_EXPIRY: process.env.JWT_TOKEN_EXPIRY || `${60 * 60}s`,
};
