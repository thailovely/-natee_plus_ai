require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_ADMIN_USER,
  password: process.env.SQL_ADMIN_PASSWORD,
  database: process.env.SQL_DB_NAME
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  else {
    console.log(res.rows[0]);
  }
  pool.end();
});
