import OrdersTable from '../components/OrdersTable';
import toast from 'react-hot-toast';

export default function Test() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Test Page: Orders Table</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => toast.success('This is a success toast!')}
      >
        Show Toast
      </button>
      <OrdersTable />
    </div>
  );
}
