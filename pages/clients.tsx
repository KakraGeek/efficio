import ClientsTable from '../components/ClientsTable';

export default function ClientsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Clients</h1>
      <ClientsTable />
    </div>
  );
} 