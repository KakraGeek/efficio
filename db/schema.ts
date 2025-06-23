import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

// The clients table stores basic client info and measurements
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(), // Clerk user ID for access control
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 255 }),
  // Standard clothing measurements
  neck: integer('neck'),
  chest: integer('chest'),
  bust: integer('bust'),
  waist: integer('waist'),
  hips: integer('hips'),
  thigh: integer('thigh'),
  inseam: integer('inseam'),
  arm_length: integer('arm_length'),
  outseam: integer('outseam'), // Standard: outseam (full leg length)
  ankle: integer('ankle'), // Standard: ankle (bottom opening)
  // Extra measurements for completeness
  shoulder: integer('shoulder'), // Shoulder width
  sleeve_length: integer('sleeve_length'), // Sleeve length
  knee: integer('knee'), // Knee circumference
  wrist: integer('wrist'), // Wrist circumference
  rise: integer('rise'), // Crotch to waist (pants)
  bicep: integer('bicep'), // Upper arm circumference
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Orders table: links to clients
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(), // Clerk user ID for access control
  client_id: integer('client_id')
    .notNull()
    .references(() => clients.id),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull(), // e.g., pending, in-progress, complete
  due_date: timestamp('due_date'),
  total_price: integer('total_price'), // in GHC pesewas
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  image_url: text('image_url'), // Path or URL to the order image (nullable)
});

// Inventory table
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(), // Clerk user ID for access control
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  quantity: integer('quantity').notNull(),
  unit: varchar('unit', { length: 20 }),
  low_stock_alert: integer('low_stock_alert'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table: links to orders
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(), // Clerk user ID for access control
  order_id: integer('order_id')
    .notNull()
    .references(() => orders.id),
  amount: integer('amount').notNull(), // in GHC pesewas
  method: varchar('method', { length: 50 }).notNull(), // e.g., MTN, AirtelTigo, Cash
  status: varchar('status', { length: 50 }),
  transaction_ref: varchar('transaction_ref', { length: 255 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  // New fields for payment type and balance
  payment_type: varchar('payment_type', { length: 50 }),
  payment_balance: integer('payment_balance'),
});

// Settings table: stores global business settings (single row expected)
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  businessName: varchar('business_name', { length: 255 }),
  address: varchar('address', { length: 255 }),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 255 }),
  logoUrl: text('logo_url'), // Store a URL or file path for the logo
});
