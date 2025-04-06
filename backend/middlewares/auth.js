import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No s'ha proporcionat el header d'autorització" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No s'ha proporcionat el token" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        console.error("Error verificació token:", err);
        return res.status(403).json({
          error: "Token invàlid",
          details: err.message,
        });
      }

      req.user = user;
      console.log(req.user);
      next();
    });
  } catch (error) {
    console.error("Error en autentificacio:", error);
    return res.status(500).json({
      error: "Error en l'autenticació",
      details: error.message,
    });
  }
};
