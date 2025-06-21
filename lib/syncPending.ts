import { getPendingClients, updateClient, getPendingOrders, updateOrder, getPendingInventory, updateInventoryItemById, getPendingPayments, updatePayment } from './indexedDb';

// Sync all clients with pendingSync === true
export async function syncPendingClients() {
  const pending = await getPendingClients();
  for (const client of pending) {
    try {
      // 1. Send to your API/server
      const res = await fetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify(client),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        // 2. Mark as synced in IndexedDB (remove pendingSync)
        await updateClient(client.id, { pendingSync: false });
      }
    } catch (err) {
      // Optionally handle errors (e.g., show a toast)
      console.error('Sync failed for client', client, err);
    }
  }
}

// Sync all orders with pendingSync === true
export async function syncPendingOrders() {
  const pending = await getPendingOrders();
  for (const order of pending) {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await updateOrder(order.id, { pendingSync: false });
      }
    } catch (err) {
      console.error('Sync failed for order', order, err);
    }
  }
}

// Sync all inventory items with pendingSync === true
export async function syncPendingInventory() {
  const pending = await getPendingInventory();
  for (const item of pending) {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await updateInventoryItemById(item.id, { pendingSync: false });
      }
    } catch (err) {
      console.error('Sync failed for inventory item', item, err);
    }
  }
}

// Sync all payments with pendingSync === true
export async function syncPendingPayments() {
  const pending = await getPendingPayments();
  for (const payment of pending) {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        body: JSON.stringify(payment),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await updatePayment(payment.id, { pendingSync: false });
      }
    } catch (err) {
      console.error('Sync failed for payment', payment, err);
    }
  }
} 