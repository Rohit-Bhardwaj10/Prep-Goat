const { Pool } = require('pg');
require('dotenv/config');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const res = await pool.query('SELECT COUNT(*) FROM "Problem"');
  console.log('Count:', res.rows[0].count);
  await pool.query('DELETE FROM "Problem"');
  console.log('Deleted all problems');
  const res2 = await pool.query('SELECT COUNT(*) FROM "Problem"');
  console.log('Count after delete:', res2.rows[0].count);
  pool.end();
}

run();
