import React, { useEffect, useState } from 'react';
import {
  getConflictedClients,
  getConflictedOrders,
  getConflictedInventory,
  getConflictedPayments,
  updateClient,
  updateOrder,
  updateInventoryItemById,
  updatePayment,
} from '../lib/indexedDb';

function ConflictTable({ title, conflicts, onResolve, fields }) {
  if (!conflicts.length) return null;
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {conflicts.map((conflict) => (
        <div key={conflict.id} className="mb-6 border-b pb-4">
          <div className="mb-2 font-semibold">ID: {conflict.id}</div>
          <table className="w-full text-sm mb-2">
            <thead>
              <tr>
                <th>Field</th>
                <th>Your Version</th>
                <th>Server Version</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field}>
                  <td>{field}</td>
                  <td>{String(conflict[field])}</td>
                  <td>{String(conflict.serverVersion?.[field] ?? '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-green-600 text-white rounded"
              onClick={() => onResolve(conflict, 'local')}
            >
              Keep My Version
            </button>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => onResolve(conflict, 'server')}
            >
              Keep Server Version
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ConflictsPage() {
  const [clientConflicts, setClientConflicts] = useState([]);
  const [orderConflicts, setOrderConflicts] = useState([]);
  const [inventoryConflicts, setInventoryConflicts] = useState([]);
  const [paymentConflicts, setPaymentConflicts] = useState([]);

  useEffect(() => {
    getConflictedClients().then(setClientConflicts);
    getConflictedOrders().then(setOrderConflicts);
    getConflictedInventory().then(setInventoryConflicts);
    getConflictedPayments().then(setPaymentConflicts);
  }, []);

  const handleResolve = async (type, conflict, choice) => {
    if (type === 'client') {
      if (choice === 'local') {
        // Sync local to server, then mark as resolved
        // ...sync logic here...
        await updateClient(conflict.id, {
          conflict: false,
          serverVersion: undefined,
        });
      } else {
        await updateClient(conflict.id, {
          ...conflict.serverVersion,
          conflict: false,
          serverVersion: undefined,
        });
      }
      setClientConflicts(clientConflicts.filter((c) => c.id !== conflict.id));
    }
    if (type === 'order') {
      if (choice === 'local') {
        // ...sync logic here...
        await updateOrder(conflict.id, {
          conflict: false,
          serverVersion: undefined,
        });
      } else {
        await updateOrder(conflict.id, {
          ...conflict.serverVersion,
          conflict: false,
          serverVersion: undefined,
        });
      }
      setOrderConflicts(orderConflicts.filter((c) => c.id !== conflict.id));
    }
    if (type === 'inventory') {
      if (choice === 'local') {
        // ...sync logic here...
        await updateInventoryItemById(conflict.id, {
          conflict: false,
          serverVersion: undefined,
        });
      } else {
        await updateInventoryItemById(conflict.id, {
          ...conflict.serverVersion,
          conflict: false,
          serverVersion: undefined,
        });
      }
      setInventoryConflicts(
        inventoryConflicts.filter((c) => c.id !== conflict.id)
      );
    }
    if (type === 'payment') {
      if (choice === 'local') {
        // ...sync logic here...
        await updatePayment(conflict.id, {
          conflict: false,
          serverVersion: undefined,
        });
      } else {
        await updatePayment(conflict.id, {
          ...conflict.serverVersion,
          conflict: false,
          serverVersion: undefined,
        });
      }
      setPaymentConflicts(paymentConflicts.filter((c) => c.id !== conflict.id));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Resolve Data Conflicts</h2>
      <ConflictTable
        title="Client Conflicts"
        conflicts={clientConflicts}
        onResolve={(conflict, choice) =>
          handleResolve('client', conflict, choice)
        }
        fields={['name', 'phone', 'email', 'notes']}
      />
      <ConflictTable
        title="Order Conflicts"
        conflicts={orderConflicts}
        onResolve={(conflict, choice) =>
          handleResolve('order', conflict, choice)
        }
        fields={['description', 'status', 'due_date', 'total_price']}
      />
      <ConflictTable
        title="Inventory Conflicts"
        conflicts={inventoryConflicts}
        onResolve={(conflict, choice) =>
          handleResolve('inventory', conflict, choice)
        }
        fields={['name', 'category', 'quantity', 'unit']}
      />
      <ConflictTable
        title="Payment Conflicts"
        conflicts={paymentConflicts}
        onResolve={(conflict, choice) =>
          handleResolve('payment', conflict, choice)
        }
        fields={[
          'amount',
          'method',
          'status',
          'payment_type',
          'payment_balance',
        ]}
      />
      {/* Add a message if no conflicts */}
      {clientConflicts.length +
        orderConflicts.length +
        inventoryConflicts.length +
        paymentConflicts.length ===
        0 && (
        <div className="text-green-700 font-semibold text-center py-8">
          No conflicts to resolve! 🎉
        </div>
      )}
    </div>
  );
}
