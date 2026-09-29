import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './db';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  console.log('🔧 Running COLORIDO 2K26 database migration...\n');
  const client = await pool.connect();
  try {
    const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(sql);
    console.log('✅ Schema applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrate();
