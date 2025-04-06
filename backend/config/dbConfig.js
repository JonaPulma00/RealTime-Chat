import dotenv from "dotenv";

dotenv.config();

export const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    enableRetryOnFailure: true,
    maxRetryCount: 3,
    retryInterval: 5,
    trustedConnection: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
  connectionTimeout: 60000,
  requestTimeout: 60000,
  pool: {
    max: 30,
    min: 5,
    idleTimeoutMillis: 30000,
  },
};
