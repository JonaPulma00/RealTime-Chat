import db from "../dbConnect.js";

export const dbMiddleware = async (req, res, next) => {
  try {
    req.dbPool = await db();
    next();
  } catch (error) {
    console.error("Error al connectar amb la base de dades:", error);
    res.status(500).json({ error: "Error al connectar amb la base de dades" });
  }
};
