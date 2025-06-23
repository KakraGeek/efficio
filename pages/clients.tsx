import ClientsTable from '../components/ClientsTable';
import { RequireAuth } from '../components/RequireAuth';

export default function ClientsPage() {
  return (
    <RequireAuth>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Clients</h1>
        <ClientsTable />
      </div>
    </RequireAuth>
  );
}
