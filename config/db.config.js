const sql = require('mssql/msnodesqlv8');

const config = {
  server: 'LAPTOP-1NLJEVTH\\SQLEXPRESS',
  database: 'InsuranceDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
};

async function getConnection() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error('ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', error);
    throw error;
  }
}

module.exports = {
  getConnection,
  sql
};
