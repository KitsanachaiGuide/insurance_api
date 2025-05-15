const { getConnection, sql } = require('../config/db.config');

// class
const InsurancePlan = function(insurancePlan) {
  this.name = insurancePlan.name;
  this.description = insurancePlan.description;
  this.minAge = insurancePlan.minAge;
  this.maxAge = insurancePlan.maxAge;
  this.monthlyPremium = insurancePlan.monthlyPremium;
};

InsurancePlan.create = async (newPlan) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('name', sql.NVarChar, newPlan.name)
      .input('description', sql.NVarChar, newPlan.description)
      .input('minAge', sql.Int, newPlan.minAge)
      .input('maxAge', sql.Int, newPlan.maxAge)
      .input('monthlyPremium', sql.Decimal, newPlan.monthlyPremium)
      .query(`
        INSERT INTO InsurancePlans (name, description, minAge, maxAge, monthlyPremium)
        OUTPUT INSERTED.id
        VALUES (@name, @description, @minAge, @maxAge, @monthlyPremium)
      `);
    
    return { id: result.recordset[0].id, ...newPlan };
  } catch (error) {
    console.error('Error creating insurance plan:', error);
    throw error;
  }
};

InsurancePlan.findAll = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM InsurancePlans');
    
    return result.recordset;
  } catch (error) {
    console.error('Error finding all insurance plans:', error);
    throw error;
  }
};

InsurancePlan.findById = async (planId) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, planId)
      .query('SELECT * FROM InsurancePlans WHERE id = @id');
    
    if (result.recordset.length) {
      return result.recordset[0];
    }
    return null;
  } catch (error) {
    console.error('Error finding insurance plan by id:', error);
    throw error;
  }
};

InsurancePlan.updateById = async (id, plan) => {
  try {
    const pool = await getConnection();
    const updatedAt = new Date(Date.now() + 7 * 60 * 60 * 1000);
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, plan.name)
      .input('description', sql.NVarChar, plan.description)
      .input('minAge', sql.Int, plan.minAge)
      .input('maxAge', sql.Int, plan.maxAge)
      .input('monthlyPremium', sql.Decimal, plan.monthlyPremium)
      .input('updatedAt', sql.DateTime, updatedAt)
      .query(`
        UPDATE InsurancePlans
        SET name = @name,
            description = @description,
            minAge = @minAge,
            maxAge = @maxAge,
            monthlyPremium = @monthlyPremium,
            updatedAt = @updatedAt
        WHERE id = @id
      `);
    
    return { id, ...plan };
  } catch (error) {
    console.error('Error updating insurance plan:', error);
    throw error;
  }
};

InsurancePlan.remove = async (id) => {
  try {
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM InsurancePlans WHERE id = @id');
    
    return { message: 'ลบแผนประกันเรียบร้อยแล้ว' };
  } catch (error) {
    console.error('Error removing insurance plan:', error);
    throw error;
  }
};

// ค้นหาแผนประกันที่เหมาะสม

InsurancePlan.suggestPlan = async (age, expectedPremium) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('age', sql.Int, age)
      .input('expectedPremium', sql.Decimal, expectedPremium)
      .query(`
        SELECT name
        FROM InsurancePlans
        WHERE @age BETWEEN minAge AND maxAge
          AND monthlyPremium <= @expectedPremium
        ORDER BY monthlyPremium ASC
      `);
    
    return result.recordset;
  } catch (error) {
    console.error('Error suggesting insurance plans:', error);
    throw error;
  }
};

module.exports = InsurancePlan;