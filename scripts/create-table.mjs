import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
  ssl: { rejectUnauthorized: false },
});
try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visit_stats (
      id INTEGER PRIMARY KEY,
      total_visits INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
  console.log('Table visit_stats created successfully');
  
  const res = await pool.query('SELECT * FROM visit_stats');
  console.log('Current rows:', res.rows);
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await pool.end();
}
