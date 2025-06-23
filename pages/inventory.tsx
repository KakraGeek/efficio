import InventoryTable from '../components/InventoryTable';
import { RequireAuth } from '../components/RequireAuth';

export default function InventoryPage() {
  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Inventory</h1>
        <InventoryTable />
      </div>
    </RequireAuth>
  );
}
