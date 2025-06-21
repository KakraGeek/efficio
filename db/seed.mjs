//import dotenv from 'dotenv';
//dotenv.config({ path: '.env.local' });

import { db } from './client.js';
import { clients, orders, inventory, payments } from './schema.js';

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function seed() {
  // Use your real Clerk user_id for all records
  const userId = 'user_2yeDmGc34gNeYbRgNJLyXq258Sq';

  // Insert sample clients
  const now = new Date();
  const insertedClients = await db.insert(clients).values([
    {
      user_id: userId,
      name: 'Ama Mensah',
      phone: '0244123456',
      email: 'ama@example.com',
      neck: 36,
      chest: 90,
      bust: 92,
      waist: 70,
      hips: 98,
      thigh: 55,
      inseam: 80,
      arm_length: 60,
      notes: 'Prefers Ankara fabrics',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      name: 'Kwame Boateng',
      phone: '0209876543',
      email: 'kwame@example.com',
      neck: 40,
      chest: 100,
      bust: 0,
      waist: 85,
      hips: 100,
      thigh: 60,
      inseam: 85,
      arm_length: 65,
      notes: 'Likes slim fit',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      name: 'Efua Asante',
      phone: '0551234567',
      email: 'efua@example.com',
      neck: 34,
      chest: 85,
      bust: 88,
      waist: 68,
      hips: 95,
      thigh: 53,
      inseam: 78,
      arm_length: 58,
      notes: 'Prefers simple styles',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      name: 'Yaw Owusu',
      phone: '0279876543',
      email: 'yaw@example.com',
      neck: 42,
      chest: 105,
      bust: 0,
      waist: 90,
      hips: 105,
      thigh: 62,
      inseam: 88,
      arm_length: 67,
      notes: 'Tall, likes classic fit',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      name: 'Akosua Dapaah',
      phone: '0248765432',
      email: 'akosua@example.com',
      neck: 35,
      chest: 88,
      bust: 90,
      waist: 72,
      hips: 97,
      thigh: 54,
      inseam: 79,
      arm_length: 59,
      notes: 'Likes bright colors',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]).returning();

  // Insert sample inventory
  await db.insert(inventory).values([
    {
      user_id: userId,
      name: 'Ankara Fabric',
      category: 'Fabric',
      quantity: 25,
      unit: 'yards',
      low_stock_alert: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      name: 'Thread - Black',
      category: 'Thread',
      quantity: 100,
      unit: 'spools',
      low_stock_alert: 20,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      name: 'Buttons',
      category: 'Accessory',
      quantity: 200,
      unit: 'pieces',
      low_stock_alert: 50,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      name: 'Zippers',
      category: 'Accessory',
      quantity: 15,
      unit: 'pieces',
      low_stock_alert: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      name: 'Lining Material',
      category: 'Fabric',
      quantity: 40,
      unit: 'yards',
      low_stock_alert: 8,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  // Insert sample orders
  const insertedOrders = await db.insert(orders).values([
    {
      user_id: userId,
      client_id: insertedClients[0].id,
      description: 'Kaba and Slit for wedding',
      status: 'pending',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      total_price: 35000, // GHC 350.00
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      client_id: insertedClients[1].id,
      description: 'Men\'s suit',
      status: 'in-progress',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      total_price: 60000, // GHC 600.00
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      client_id: insertedClients[2].id,
      description: 'Casual dress',
      status: 'complete',
      due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      total_price: 20000, // GHC 200.00
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      client_id: insertedClients[3].id,
      description: 'Traditional wear',
      status: 'pending',
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      total_price: 45000, // GHC 450.00
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      client_id: insertedClients[4].id,
      description: 'Evening gown',
      status: 'in-progress',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      total_price: 80000, // GHC 800.00
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]).returning();

  // Insert sample payments
  await db.insert(payments).values([
    {
      user_id: userId,
      order_id: insertedOrders[0].id,
      amount: 20000,
      method: 'MTN Mobile Money',
      status: 'completed',
      transaction_ref: 'MTN123456',
      created_at: new Date(),
    },
    {
      user_id: userId,
      order_id: insertedOrders[1].id,
      amount: 30000,
      method: 'Cash',
      status: 'pending',
      transaction_ref: 'CASH98765',
      created_at: new Date(),
    },
    {
      user_id: userId,
      order_id: insertedOrders[2].id,
      amount: 20000,
      method: 'ATMoney',
      status: 'completed',
      transaction_ref: 'ATG54321',
      created_at: new Date(),
    },
    {
      user_id: userId,
      order_id: insertedOrders[3].id,
      amount: 45000,
      method: 'MTN Mobile Money',
      status: 'completed',
      transaction_ref: 'MTN789012',
      created_at: new Date(),
    },
    {
      user_id: userId,
      order_id: insertedOrders[4].id,
      amount: 80000,
      method: 'Cash',
      status: 'pending',
      transaction_ref: 'CASH65432',
      created_at: new Date(),
    },
    {
      user_id: userId,
      order_id: insertedOrders[0].id,
      amount: 15000,
      method: 'Telecel Cash',
      status: 'completed',
      transaction_ref: 'TCCASH001',
      created_at: new Date(),
    },
  ]);

  console.log('Sample data seeded!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 