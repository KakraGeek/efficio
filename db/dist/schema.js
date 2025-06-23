'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.payments =
  exports.inventory =
  exports.orders =
  exports.clients =
    void 0;
var pg_core_1 = require('drizzle-orm/pg-core');
// The clients table stores basic client info and measurements
exports.clients = (0, pg_core_1.pgTable)('clients', {
  id: (0, pg_core_1.serial)('id').primaryKey(),
  user_id: (0, pg_core_1.text)('user_id').notNull(), // Clerk user ID for access control
  name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
  phone: (0, pg_core_1.varchar)('phone', { length: 30 }),
  email: (0, pg_core_1.varchar)('email', { length: 255 }),
  // Standard clothing measurements
  neck: (0, pg_core_1.integer)('neck'),
  chest: (0, pg_core_1.integer)('chest'),
  bust: (0, pg_core_1.integer)('bust'),
  waist: (0, pg_core_1.integer)('waist'),
  hips: (0, pg_core_1.integer)('hips'),
  thigh: (0, pg_core_1.integer)('thigh'),
  inseam: (0, pg_core_1.integer)('inseam'),
  arm_length: (0, pg_core_1.integer)('arm_length'),
  outseam: (0, pg_core_1.integer)('outseam'), // Standard: outseam (full leg length)
  ankle: (0, pg_core_1.integer)('ankle'), // Standard: ankle (bottom opening)
  // Extra measurements for completeness
  shoulder: (0, pg_core_1.integer)('shoulder'), // Shoulder width
  sleeve_length: (0, pg_core_1.integer)('sleeve_length'), // Sleeve length
  knee: (0, pg_core_1.integer)('knee'), // Knee circumference
  wrist: (0, pg_core_1.integer)('wrist'), // Wrist circumference
  rise: (0, pg_core_1.integer)('rise'), // Crotch to waist (pants)
  bicep: (0, pg_core_1.integer)('bicep'), // Upper arm circumference
  notes: (0, pg_core_1.text)('notes'),
  created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
  updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Orders table: links to clients
exports.orders = (0, pg_core_1.pgTable)('orders', {
  id: (0, pg_core_1.serial)('id').primaryKey(),
  user_id: (0, pg_core_1.text)('user_id').notNull(), // Clerk user ID for access control
  client_id: (0, pg_core_1.integer)('client_id')
    .notNull()
    .references(function () {
      return exports.clients.id;
    }),
  description: (0, pg_core_1.text)('description'),
  status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull(), // e.g., pending, in-progress, complete
  due_date: (0, pg_core_1.timestamp)('due_date'),
  total_price: (0, pg_core_1.integer)('total_price'), // in GHC pesewas
  created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
  updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
  image_url: (0, pg_core_1.text)('image_url'), // Path or URL to the order image (nullable)
});
// Inventory table
exports.inventory = (0, pg_core_1.pgTable)('inventory', {
  id: (0, pg_core_1.serial)('id').primaryKey(),
  user_id: (0, pg_core_1.text)('user_id').notNull(), // Clerk user ID for access control
  name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
  category: (0, pg_core_1.varchar)('category', { length: 100 }),
  quantity: (0, pg_core_1.integer)('quantity').notNull(),
  unit: (0, pg_core_1.varchar)('unit', { length: 20 }),
  low_stock_alert: (0, pg_core_1.integer)('low_stock_alert'),
  created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
  updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Payments table: links to orders
exports.payments = (0, pg_core_1.pgTable)('payments', {
  id: (0, pg_core_1.serial)('id').primaryKey(),
  user_id: (0, pg_core_1.text)('user_id').notNull(), // Clerk user ID for access control
  order_id: (0, pg_core_1.integer)('order_id')
    .notNull()
    .references(function () {
      return exports.orders.id;
    }),
  amount: (0, pg_core_1.integer)('amount').notNull(), // in GHC pesewas
  method: (0, pg_core_1.varchar)('method', { length: 50 }).notNull(), // e.g., MTN, AirtelTigo, Cash
  status: (0, pg_core_1.varchar)('status', { length: 50 }),
  transaction_ref: (0, pg_core_1.varchar)('transaction_ref', { length: 255 }),
  created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
  // New fields for payment type and balance
  payment_type: (0, pg_core_1.varchar)('payment_type', { length: 50 }),
  payment_balance: (0, pg_core_1.integer)('payment_balance'),
});
