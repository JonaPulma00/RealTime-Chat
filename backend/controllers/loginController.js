import bcrypt from "bcrypt";
import sql from "mssql";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const BCRYPT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = "20m";
const REFRESH_TOKEN_EXPIRY = "7d";

export const registerUsers = async (req, res) => {
  const { user, email, password, role = 0 } = req.body;

  if (![0, 1].includes(role)) {
    return res.status(400).json({
      success: false,
      error: "El rol ha de ser 0 (usuari normal) o 1 (administrador)",
    });
  }

  if (!user || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Tots els camps són obligatoris",
    });
  }

  try {
    const pool = await req.dbPool;

    const checkResult = await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("user", sql.VarChar, user)
      .query(
        "SELECT (SELECT COUNT(*) FROM users WHERE email = @email) AS emailCount, " +
          "(SELECT COUNT(*) FROM users WHERE [user] = @user) AS userCount"
      );

    const { emailCount, userCount } = checkResult.recordset[0];

    if (emailCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Este correo ya esta registrado ",
      });
    }

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Este nombre de usuario ya está en uso",
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const request = new sql.Request(transaction);
      await request
        .input("user", sql.VarChar, user)
        .input("email", sql.VarChar, email)
        .input("password", sql.VarChar, hashedPassword)
        .input("role", sql.Int, role)
        .query(
          "INSERT INTO users ([user], email, [password], RoleId) VALUES (@user, @email, @password, @role)"
        );

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Usuari registrat correctament",
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al registrar l'usuari", error);
    res.status(500).json({
      success: false,
      error: "Error al registrar l'usuari",
    });
  }
};

export const loginUsers = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email i contraseña son obligatorios" });
  }

  try {
    const result = await req.dbPool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT UserId, email, password FROM users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario y/o contraseña incorrectos" });
    }

    const user = result.recordset[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ error: "Usuario y/o contraseña incorrectos" });
    }

    const [accessToken, refreshToken] = await Promise.all([
      jwt.sign(
        { userId: user.UserId, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      ),
      jwt.sign({ userId: user.UserId }, process.env.SECRET_REFRESH_KEY, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      }),
    ]);

    res
      .status(200)
      .json({ token: accessToken, refreshToken, userId: user.UserId });
  } catch (error) {
    console.error("Error al iniciar sessió:", error);
    res.status(500).json({ error: "Error al iniciar sessió" });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.SECRET_REFRESH_KEY,
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        }
      );
    });

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};
