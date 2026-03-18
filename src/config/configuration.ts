export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || '5432', 10),
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
});
