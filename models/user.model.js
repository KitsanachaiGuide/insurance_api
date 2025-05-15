const { getConnection, sql } = require('../config/db.config');

const User = function(user) {
  this.name = user.name;
  this.age = user.age;
  this.expectedPremium = user.expectedPremium;
  this.isActive = user.isActive !== undefined ? user.isActive : true;
};

User.create = async (newUser) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('name', sql.NVarChar, newUser.name)
      .input('age', sql.Int, newUser.age)
      .input('expectedPremium', sql.Decimal, newUser.expectedPremium)
      .input('isActive', sql.Bit, newUser.isActive !== undefined ? (newUser.isActive ? 1 : 0) : 1)
      .query(`
        INSERT INTO Users (name, age, expectedPremium, isActive)
        OUTPUT INSERTED.id
        VALUES (@name, @age, @expectedPremium, @isActive)
      `);
    
    return { id: result.recordset[0].id, ...newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

User.findAll = async (includeInactive = false) => {
  try {
    const pool = await getConnection();
    let query = 'SELECT * FROM Users';
    
    if (!includeInactive) {
      query += ' WHERE isActive = 1';
    }
    
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error finding all users:', error);
    throw error;
  }
};

User.findById = async (userId, includeInactive = false) => {
  try {
    const pool = await getConnection();
    const request = pool.request().input('id', sql.Int, userId);
    
    let query = 'SELECT * FROM Users WHERE id = @id';
    if (!includeInactive) {
      query += ' AND isActive = 1';
    }
    
    const result = await request.query(query);
    
    if (result.recordset.length) {
      return result.recordset[0];
    }
    return null;
  } catch (error) {
    console.error('Error finding user by id:', error);
    throw error;
  }
};

User.updateById = async (id, user) => {
  try {
    const pool = await getConnection();
    const updatedAt = new Date(Date.now() + 7 * 60 * 60 * 1000);
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, user.name)
      .input('age', sql.Int, user.age)
      .input('expectedPremium', sql.Decimal, user.expectedPremium)
      .input('isActive', sql.Bit, user.isActive !== undefined ? (user.isActive ? 1 : 0) : 1)
      .input('updatedAt', sql.DateTime, updatedAt)
      .query(`
        UPDATE Users
        SET name = @name,
            age = @age,
            expectedPremium = @expectedPremium,
            isActive = @isActive,
            updatedAt = @updatedAt
        WHERE id = @id
      `);
    
    return { id, ...user };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

User.remove = async (id) => {
  try {
    const pool = await getConnection();
    const updatedAt = new Date(Date.now() + 7 * 60 * 60 * 1000);
    await pool.request()
      .input('id', sql.Int, id)
      .input('updatedAt', sql.DateTime, updatedAt)
      .query(`
        UPDATE Users
        SET isActive = 0,
            updatedAt = @updatedAt
        WHERE id = @id
      `);
    
    return { message: 'ลบข้อมูลผู้ใช้เรียบร้อยแล้ว' };
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

// ดึงข้อมูล suggest plans สำหรับผู้ใช้รายนี้
User.getSuggestedPlans = async (userId) => {
  try {
    // ดึงข้อมูลผู้ใช้
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`ไม่พบข้อมูลผู้ใช้หมายเลข ${userId}`);
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('age', sql.Int, user.age)
      .input('expectedPremium', sql.Decimal, user.expectedPremium)
      .query(`
        SELECT *
        FROM InsurancePlans
        WHERE @age BETWEEN minAge AND maxAge
          AND monthlyPremium <= @expectedPremium
          AND isActive = 1
        ORDER BY monthlyPremium DESC
      `);
    
    return {
      user: user,
      plans: result.recordset
    };
  } catch (error) {
    console.error('Error getting suggested plans:', error);
    throw error;
  }
};

module.exports = User;