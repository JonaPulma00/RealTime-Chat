import sql from "mssql";
export const getGroups = async (req, res) => {
  try {
    const pool = await req.dbPool;
    const query = `
      SELECT 
        GroupId, 
        GroupName, 
        CreatedBy, 
        CreatedAt,
        imageUrl
      FROM Groups
    `;
    const result = await pool.request().query(query);
    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obtenint els grups",
      error: error.message,
    });
  }
};

export const groupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const pool = await req.dbPool;

    const query = `
      SELECT 
        m.MessageId,
        m.Content,
        m.SentAt,
        u.UserId,
        u.[user] AS Username
      FROM Messages m
      INNER JOIN Users u ON m.UserId = u.UserId
      WHERE m.GroupId = @groupId
      ORDER BY m.SentAt ASC
      OFFSET ${(page - 1) * limit} ROWS 
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const result = await pool
      .request()
      .input("groupId", sql.UniqueIdentifier, groupId)
      .query(query);
    res.status(200).json({
      success: true,
      data: result.recordset,
      pagination: { page, limit },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllGroupsData = async (req, res) => {
  try {
    const pool = await req.dbPool;
    const query = `
      SELECT 
        g.GroupId,
        g.GroupName,
        g.ImageUrl,
        (SELECT COUNT(*) FROM UserGroups ug WHERE ug.GroupId = g.GroupId) AS MemberCount,
        COUNT(m.MessageId) AS TotalMessages
      FROM Groups g
      LEFT JOIN Messages m ON g.GroupId = m.GroupId
      GROUP BY g.GroupId, g.GroupName, g.imageUrl
    `;

    const result = await pool.request().query(query);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const pool = await req.dbPool;

    const existing = await pool
      .request()
      .input("userId", sql.UniqueIdentifier, userId)
      .input("groupId", sql.UniqueIdentifier, groupId)
      .query(
        "SELECT * FROM UserGroups WHERE UserId = @userId AND GroupId = @groupId"
      );

    if (existing.recordset.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "You are already on the group" });
    }

    await pool
      .request()
      .input("userId", sql.UniqueIdentifier, userId)
      .input("groupId", sql.UniqueIdentifier, groupId).query(`
        INSERT INTO UserGroups (UserId, GroupId, RoleInGroup, JoinedAt) 
        VALUES (@userId, @groupId, 'Usuari-normal', GETDATE())
      `);

    res.status(200).json({
      success: true,
      message: "Joined Succesfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const pool = await req.dbPool;

    await pool
      .request()
      .input("userId", sql.UniqueIdentifier, userId)
      .input("groupId", sql.UniqueIdentifier, groupId)
      .query(
        "DELETE FROM UserGroups WHERE UserId = @userId AND GroupId = @groupId"
      );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("ID DE L'USUARI: ", userId);
    const pool = await req.dbPool;

    const result = await pool
      .request()
      .input("userId", sql.UniqueIdentifier, userId).query(`
        SELECT 
          g.GroupId,
          g.GroupName,
          g.imageUrl,
          ug.JoinedAt
        FROM UserGroups ug
        INNER JOIN Groups g ON ug.GroupId = g.GroupId
        WHERE ug.UserId = @userId
      `);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
