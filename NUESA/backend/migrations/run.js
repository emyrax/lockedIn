import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name VARCHAR(255) PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const { rows: ran } = await client.query('SELECT name FROM _migrations ORDER BY name');
    const ranSet = new Set(ran.map(r => r.name));

    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (ranSet.has(file)) {
        console.log(`  SKIP ${file} (already run)`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      const sql = fs.readFileSync(join(__dirname, file), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      console.log(`  ✓ ${file} completed`);
    }

    console.log('\nAll migrations completed successfully');
  } catch (err) {
    console.error(`Migration failed:`, err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }

  process.exit(0);
}

runMigrations();