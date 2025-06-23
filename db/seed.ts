import { db } from './client';
import { clients, orders, inventory, payments } from './schema';

async function seed() {
  // Use a placeholder Clerk user_id for all records
  const userId = 'sample-user-id';

  // 1. Delete all data from all tables (order matters for foreign keys)
  await db.delete(payments);
  await db.delete(orders);
  await db.delete(inventory);
  await db.delete(clients);

  // 2. Insert 5 sample clients
  const insertedClients = await db
    .insert(clients)
    .values([
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
        outseam: 100,
        ankle: 22,
        shoulder: 40,
        sleeve_length: 60,
        knee: 38,
        wrist: 16,
        rise: 28,
        bicep: 30,
        notes: 'Prefers Ankara fabrics',
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
        outseam: 105,
        ankle: 24,
        shoulder: 45,
        sleeve_length: 65,
        knee: 42,
        wrist: 18,
        rise: 30,
        bicep: 32,
        notes: 'Likes slim fit',
      },
      {
        user_id: userId,
        name: 'Efua Sarpong',
        phone: '0261234567',
        email: 'efua@example.com',
        neck: 34,
        chest: 85,
        bust: 88,
        waist: 68,
        hips: 95,
        thigh: 53,
        inseam: 78,
        arm_length: 58,
        outseam: 98,
        ankle: 21,
        shoulder: 38,
        sleeve_length: 58,
        knee: 36,
        wrist: 15,
        rise: 27,
        bicep: 28,
        notes: 'Prefers bright colors',
      },
      {
        user_id: userId,
        name: 'Yaw Ofori',
        phone: '0277654321',
        email: 'yaw@example.com',
        neck: 42,
        chest: 105,
        bust: 0,
        waist: 90,
        hips: 105,
        thigh: 62,
        inseam: 88,
        arm_length: 67,
        outseam: 110,
        ankle: 25,
        shoulder: 47,
        sleeve_length: 67,
        knee: 44,
        wrist: 19,
        rise: 32,
        bicep: 34,
        notes: 'Tall, prefers classic styles',
      },
      {
        user_id: userId,
        name: 'Akosua Addo',
        phone: '0256789123',
        email: 'akosua@example.com',
        neck: 35,
        chest: 88,
        bust: 90,
        waist: 72,
        hips: 97,
        thigh: 54,
        inseam: 79,
        arm_length: 59,
        outseam: 99,
        ankle: 22,
        shoulder: 39,
        sleeve_length: 59,
        knee: 37,
        wrist: 16,
        rise: 28,
        bicep: 29,
        notes: 'Likes modern designs',
      },
    ])
    .returning();

  // 3. Insert 5 sample inventory items
  await db.insert(inventory).values([
    {
      user_id: userId,
      name: 'Ankara Fabric',
      category: 'Fabric',
      quantity: 25,
      unit: 'yards',
      low_stock_alert: 5,
    },
    {
      user_id: userId,
      name: 'Thread - Black',
      category: 'Thread',
      quantity: 100,
      unit: 'spools',
      low_stock_alert: 20,
    },
    {
      user_id: userId,
      name: 'Buttons',
      category: 'Accessory',
      quantity: 200,
      unit: 'pieces',
      low_stock_alert: 50,
    },
    {
      user_id: userId,
      name: 'Zippers',
      category: 'Accessory',
      quantity: 15,
      unit: 'pieces',
      low_stock_alert: 10,
    },
    {
      user_id: userId,
      name: 'Lining Material',
      category: 'Fabric',
      quantity: 40,
      unit: 'yards',
      low_stock_alert: 8,
    },
  ]);

  // 4. Insert 5 sample orders
  const insertedOrders = await db
    .insert(orders)
    .values([
      {
        user_id: userId,
        client_id: insertedClients[0].id,
        description: 'Kaba and Slit for wedding',
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        total_price: 35000,
        image_url: null,
      },
      {
        user_id: userId,
        client_id: insertedClients[1].id,
        description: "Men's suit",
        status: 'in-progress',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        total_price: 60000,
        image_url: null,
      },
      {
        user_id: userId,
        client_id: insertedClients[2].id,
        description: 'Casual dress',
        status: 'completed',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        total_price: 20000,
        image_url: null,
      },
      {
        user_id: userId,
        client_id: insertedClients[3].id,
        description: 'Traditional smock',
        status: 'pending',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        total_price: 45000,
        image_url: null,
      },
      {
        user_id: userId,
        client_id: insertedClients[4].id,
        description: 'Evening gown',
        status: 'extended',
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        total_price: 80000,
        image_url: null,
      },
    ])
    .returning();

  // 5. Insert 5 sample payments (with new fields)
  await db.insert(payments).values([
    {
      user_id: userId,
      order_id: insertedOrders[0].id,
      amount: 20000,
      method: 'MTN',
      status: 'completed',
      transaction_ref: 'MTN123456',
      payment_type: 'Deposit',
      payment_balance: 15000,
    },
    {
      user_id: userId,
      order_id: insertedOrders[1].id,
      amount: 60000,
      method: 'Cash',
      status: 'completed',
      transaction_ref: 'CASH98765',
      payment_type: 'Full payment',
      payment_balance: 0,
    },
    {
      user_id: userId,
      order_id: insertedOrders[2].id,
      amount: 10000,
      method: 'AirtelTigo',
      status: 'pending',
      transaction_ref: 'ATG54321',
      payment_type: 'Deposit',
      payment_balance: 10000,
    },
    {
      user_id: userId,
      order_id: insertedOrders[3].id,
      amount: 25000,
      method: 'Telecel Cash',
      status: 'completed',
      transaction_ref: 'TCC12345',
      payment_type: 'Deposit',
      payment_balance: 20000,
    },
    {
      user_id: userId,
      order_id: insertedOrders[4].id,
      amount: 80000,
      method: 'MTN',
      status: 'completed',
      transaction_ref: 'MTN654321',
      payment_type: 'Full payment',
      payment_balance: 0,
    },
  ]);

  console.log('Sample data reset and seeded!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
