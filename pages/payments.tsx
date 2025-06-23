import PaymentsTable from '../components/PaymentsTable';

export default function PaymentsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      <PaymentsTable />
    </div>
  );
}
