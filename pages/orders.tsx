import OrdersTable from '../components/OrdersTable';
import { RequireAuth } from '../components/RequireAuth';

export default function OrdersPage() {
  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <OrdersTable />
      </div>
    </RequireAuth>
  );
}
