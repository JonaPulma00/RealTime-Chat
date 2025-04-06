import sql from "mssql";
import { config } from "./config/dbConfig.js";

let pool;

const connectDb = async () => {
  try {
    if (!pool) {
      pool = new sql.ConnectionPool(config);
      await pool.connect();
      console.log("Connexió amb la base de dades correcte");
    }
    return pool;
  } catch (err) {
    console.error("Error de connexió:", err.message);
    throw err;
  }
};

connectDb();

export default connectDb;
