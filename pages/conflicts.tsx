import React, { useEffect, useState } from 'react';
import { RequireAuth } from '../components/RequireAuth';
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

// Define a generic Conflict type
interface Conflict {
  id: number;
  [key: string]: any;
  serverVersion?: { [key: string]: any };
}

interface ConflictTableProps {
  title: string;
  conflicts: Conflict[];
  onResolve: (conflict: Conflict, choice: string) => void;
  fields: string[];
}

function ConflictTable({
  title,
  conflicts,
  onResolve,
  fields,
}: ConflictTableProps) {
  if (!conflicts.length) return null;
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      {conflicts.map((conflict: Conflict) => (
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
              {fields.map((field: string) => (
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
  const [clientConflicts, setClientConflicts] = useState<Conflict[]>([]);
  const [orderConflicts, setOrderConflicts] = useState<Conflict[]>([]);
  const [inventoryConflicts, setInventoryConflicts] = useState<Conflict[]>([]);
  const [paymentConflicts, setPaymentConflicts] = useState<Conflict[]>([]);

  useEffect(() => {
    getConflictedClients().then(setClientConflicts);
    getConflictedOrders().then(setOrderConflicts);
    getConflictedInventory().then(setInventoryConflicts);
    getConflictedPayments().then(setPaymentConflicts);
  }, []);

  const handleResolve = async (
    type: 'client' | 'order' | 'inventory' | 'payment',
    conflict: Conflict,
    choice: string
  ) => {
    if (type === 'client') {
      if (choice === 'local') {
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
    <RequireAuth>
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
    </RequireAuth>
  );
}
