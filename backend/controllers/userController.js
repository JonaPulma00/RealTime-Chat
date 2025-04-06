import { validationResult } from "express-validator";
import sql from "mssql";
import bcrypt from "bcrypt";

export const sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.userId;
    const { content, groupId } = req.body;

    const pool = await req.dbPool;
    const result = await pool
      .request()
      .input("UserId", sql.UniqueIdentifier, userId)
      .input("GroupId", sql.UniqueIdentifier, groupId)
      .input("Content", sql.NVarChar(sql.MAX), content).query(`
              INSERT INTO Messages (UserId, GroupId, Content)
              OUTPUT INSERTED.MessageId, INSERTED.SentAt
              VALUES (@UserId, @GroupId, @Content)
          `);

    res.status(201).json({
      success: true,
      message: "Missatge enviat correctament",
      data: {
        messageId: result.recordset[0].MessageId,
        content: content,
        sentAt: result.recordset[0].SentAt,
      },
    });
  } catch (error) {
    console.error("Error enviant missatge", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar el missatge",
      error: error.message,
    });
  }
};

export const userData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.params;
    const pool = await req.dbPool;

    const result = await pool
      .request()
      .input("userId", sql.UniqueIdentifier, userId).query(`
        SELECT UserId, [user], email, RoleId, CreatedAt
        FROM Users
        WHERE UserId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuari no trobat",
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Error obtenint dades d'usuari:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtenir dades d'usuari",
      error: error.message,
    });
  }
};

export const updateUserData = async (req, res) => {
  const { userId } = req.params;
  const { username, password } = req.body;

  try {
    if (req.user.userId !== userId) {
      return res
        .status(403)
        .json({ error: "No authorization to update this user" });
    }

    const pool = await req.dbPool;
    let request = pool.request();

    let updateClauses = [];

    if (username) {
      updateClauses.push("[user] = @username");
      request.input("username", sql.VarChar, username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateClauses.push("[password] = @password");
      request.input("password", sql.VarChar, hashedPassword);
    }

    if (updateClauses.length === 0) {
      return res
        .status(400)
        .json({ error: "No es proporcionen camps per actualitzar" });
    }

    request.input("userId", sql.UniqueIdentifier, userId);

    const query = `
            UPDATE Users 
            SET ${updateClauses.join(", ")}
            WHERE UserId = @userId
        `;

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Usuari not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Usuario actualitzat correcte" });
  } catch (error) {
    console.error("Error al actualitzar:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualitzar usuari",
      details: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const pool = await req.dbPool;
    const query = `
    SELECT [user], email, CreatedAt
    FROM Users
      `;

    const result = await pool.request().query(query);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    next(error);
  }
};
