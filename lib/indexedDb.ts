import { openDB, DBSchema, IDBPDatabase } from 'idb';

// 1. Define your database schema
interface EfficioDB extends DBSchema {
  clients: { key: number; value: any };
  orders: { key: number; value: any };
  inventory: { key: number; value: any };
  payments: { key: number; value: any };
}

// 2. Open (or create) the database
export async function getDB(): Promise<IDBPDatabase<EfficioDB>> {
  return openDB<EfficioDB>('efficio-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('clients')) {
        db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('inventory')) {
        db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('payments')) {
        db.createObjectStore('payments', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

// Add or update a client
export async function addClient(client: any) {
  const db = await getDB();
  if (client.id) {
    await db.put('clients', client); // update if id exists
  } else {
    await db.add('clients', client); // add new
  }
}

// Get all clients
export async function getAllClients() {
  const db = await getDB();
  return db.getAll('clients');
}

// Update a client by id
export async function updateClient(id: number, updates: any) {
  const db = await getDB();
  const client = await db.get('clients', id);
  if (client) {
    await db.put('clients', { ...client, ...updates });
  }
}

// Get all clients with pendingSync === true
export async function getPendingClients() {
  const db = await getDB();
  const all = await db.getAll('clients');
  return all.filter(c => c.pendingSync);
}

// Get all clients with conflict === true
export async function getConflictedClients() {
  const db = await getDB();
  const all = await db.getAll('clients');
  return all.filter(c => c.conflict);
}

// Add similar helpers for orders, inventory, and payments as needed
export async function addOrder(order: any) {
  const db = await getDB();
  await db.add('orders', order);
}

export async function getAllOrders() {
  const db = await getDB();
  return db.getAll('orders');
}

// Get all orders with conflict === true
export async function getConflictedOrders() {
  const db = await getDB();
  const all = await db.getAll('orders');
  return all.filter(o => o.conflict);
}

export async function addInventoryItem(item: any) {
  const db = await getDB();
  await db.add('inventory', item);
}

export async function getAllInventory() {
  const db = await getDB();
  return db.getAll('inventory');
}

// Get all inventory items with conflict === true
export async function getConflictedInventory() {
  const db = await getDB();
  const all = await db.getAll('inventory');
  return all.filter(i => i.conflict);
}

export async function addPayment(payment: any) {
  const db = await getDB();
  await db.add('payments', payment);
}

export async function getAllPayments() {
  const db = await getDB();
  return db.getAll('payments');
}

// Get all payments with conflict === true
export async function getConflictedPayments() {
  const db = await getDB();
  const all = await db.getAll('payments');
  return all.filter(p => p.conflict);
}

// Get all orders with pendingSync === true
export async function getPendingOrders() {
  const db = await getDB();
  const all = await db.getAll('orders');
  return all.filter(o => o.pendingSync);
}

// Update an order by id
export async function updateOrder(id: number, updates: any) {
  const db = await getDB();
  const order = await db.get('orders', id);
  if (order) {
    await db.put('orders', { ...order, ...updates });
  }
}

// Get all inventory items with pendingSync === true
export async function getPendingInventory() {
  const db = await getDB();
  const all = await db.getAll('inventory');
  return all.filter(i => i.pendingSync);
}

// Update an inventory item by id
export async function updateInventoryItemById(id: number, updates: any) {
  const db = await getDB();
  const item = await db.get('inventory', id);
  if (item) {
    await db.put('inventory', { ...item, ...updates });
  }
}

// Get all payments with pendingSync === true
export async function getPendingPayments() {
  const db = await getDB();
  const all = await db.getAll('payments');
  return all.filter(p => p.pendingSync);
}

// Update a payment by id
export async function updatePayment(id: number, updates: any) {
  const db = await getDB();
  const payment = await db.get('payments', id);
  if (payment) {
    await db.put('payments', { ...payment, ...updates });
  }
} 