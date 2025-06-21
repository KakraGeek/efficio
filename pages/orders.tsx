import OrdersTable from '../components/OrdersTable';

export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Orders Table</h1>
      <OrdersTable />
    </div>
  );
} 