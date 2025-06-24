'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.db = void 0;
var pg_1 = require('pg');
var node_postgres_1 = require('drizzle-orm/node-postgres');
var schema = require('./schema');
// Create a connection pool for PostgreSQL
var pool = new pg_1.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Force SSL for Neon
  // Optional: set pool options like max: 10 for max 10 connections
  // max: 10,
});
// Export the Drizzle database client
exports.db = (0, node_postgres_1.drizzle)(pool, { schema: schema });
