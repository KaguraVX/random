import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable. Configure it in Vercel.');
}

const pool = global.__pgPool ?? new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.__pgPool = pool;
}

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function ensureDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      description text NOT NULL,
      amount numeric NOT NULL,
      category text NOT NULL,
      date text NOT NULL,
      created_at timestamp with time zone DEFAULT now()
    );
  `);
}
