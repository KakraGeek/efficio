import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// Create a connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Force SSL for Neon
  // Optional: set pool options like max: 10 for max 10 connections
  // max: 10,
});

// Export the Drizzle database client
export const db = drizzle(pool, { schema });
