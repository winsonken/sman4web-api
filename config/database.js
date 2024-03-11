const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 10,
  //   enableKeepAlive: true,
  //   keepAliveInitialDelay: 0,
});

async function query(query, value) {
  try {
    const [executeQuery] = await db.query(query, value ?? []);
    return executeQuery;
  } catch (error) {
    console.log(error);
  }
}

module.exports = query;
