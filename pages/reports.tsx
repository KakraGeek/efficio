import React, { useState } from 'react';
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { trpc } from '../utils/trpc';
import toast from 'react-hot-toast';

const clientReports = [
  { label: 'Select a report...', value: '' },
  { label: 'All Clients', value: 'all' },
  { label: 'New Clients This Month', value: 'new' },
];
const orderReports = [
  { label: 'Select a report...', value: '' },
  { label: 'All Orders', value: 'all' },
  { label: 'Pending Orders', value: 'pending' },
  { label: 'Completed Orders', value: 'completed' },
  { label: 'Extended Orders', value: 'extended' },
];
const paymentReports = [
  { label: 'Select a report...', value: '' },
  { label: 'All Payments', value: 'all' },
  { label: 'Outstanding Payments', value: 'outstanding' },
];
const inventoryReports = [
  { label: 'Select a report...', value: '' },
  { label: 'All Inventory', value: 'all' },
  { label: 'Low Stock Items', value: 'lowstock' },
];

function exportCSV(data: any[], columns: any[], filename: string) {
  try {
    const csv = [columns.map((c: any) => c.header).join(',')]
      .concat(data.map((row: any) => columns.map((c: any) => row[c.accessor]).join(',')))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV export started!');
  } catch (err) {
    toast.error('CSV export failed.');
  }
}

async function exportPDF(data: any[], columns: any[], filename: string) {
  try {
    const jsPDFModule = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDFModule.jsPDF();
    const headers = [columns.map((c: any) => c.header)];
    const rows = data.map((row: any) => columns.map((c: any) => {
      if (c.accessor === 'total_price' || c.accessor === 'paid' || c.accessor === 'outstanding' || c.accessor === 'amount') {
        return row[c.accessor] !== undefined && row[c.accessor] !== null
          ? `₵${(row[c.accessor] / 100).toLocaleString()}`
          : '';
      }
      return row[c.accessor];
    }));

    autoTable(doc, { head: headers, body: rows });
    doc.save(filename.replace('.csv', '.pdf'));
    toast.success('PDF export started!');
  } catch (err) {
    toast.error('PDF export failed.');
  }
}

function formatDateBritish(dateValue: string | Date) {
  const d = new Date(dateValue);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ReportsPage() {
  // Fetch real data
  const clients = trpc.getClients.useQuery();
  const orders = trpc.getOrders.useQuery();
  const payments = trpc.getPayments.useQuery();
  const inventory = trpc.getInventory.useQuery();

  // Dropdown state
  const [clientReport, setClientReport] = useState('');
  const [orderReport, setOrderReport] = useState('');
  const [paymentReport, setPaymentReport] = useState('');
  const [inventoryReport, setInventoryReport] = useState('');

  // Export format state
  const [clientExportFormat, setClientExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [orderExportFormat, setOrderExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [paymentExportFormat, setPaymentExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [inventoryExportFormat, setInventoryExportFormat] = useState<'csv' | 'pdf'>('csv');

  if (clients.isLoading || orders.isLoading || payments.isLoading || inventory.isLoading) {
    return <div className="p-8 text-center">Loading reports...</div>;
  }
  if (clients.error || orders.error || payments.error || inventory.error) {
    return <div className="p-8 text-center text-red-500">Error loading reports.</div>;
  }

  // --- Clients Report Data ---
  let clientData: any[] = [];
  if (clientReport === 'all') {
    clientData = clients.data || [];
  } else if (clientReport === 'new') {
    const now = new Date();
    clientData = (clients.data || []).filter(c => {
      const d = new Date(c.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }
  const clientColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    { header: 'Created At', accessor: 'created_at' },
  ];

  // --- Orders Report Data ---
  let orderData: any[] = [];
  if (orderReport === 'all') {
    orderData = orders.data || [];
  } else if (orderReport === 'pending') {
    orderData = (orders.data || []).filter(o => o.status.toLowerCase().includes('pending'));
  } else if (orderReport === 'completed') {
    orderData = (orders.data || []).filter(o => o.status.toLowerCase().includes('complete'));
  } else if (orderReport === 'extended') {
    orderData = (orders.data || []).filter(o => o.status.toLowerCase() === 'extended');
  }
  const orderColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Client ID', accessor: 'client_id' },
    { header: 'Status', accessor: 'status' },
    { header: 'Total Price', accessor: 'total_price' },
    { header: 'Created At', accessor: 'created_at' },
  ];

  // --- Payments Report Data ---
  let paymentData: any[] = [];
  if (paymentReport === 'all') {
    paymentData = payments.data || [];
  } else if (paymentReport === 'outstanding') {
    paymentData = (orders.data || []).map(o => {
      const paid = (payments.data || []).filter(p => p.order_id === o.id).reduce((s, p) => s + (p.amount || 0), 0);
      return {
        order_id: o.id,
        client_id: o.client_id,
        total_price: o.total_price,
        paid,
        outstanding: Math.max((o.total_price || 0) - paid, 0),
      };
    }).filter(r => r.outstanding > 0);
  }
  const paymentColumns = paymentReport === 'all'
    ? [
        { header: 'ID', accessor: 'id' },
        { header: 'Order ID', accessor: 'order_id' },
        { header: 'Amount', accessor: 'amount' },
        { header: 'Method', accessor: 'method' },
        { header: 'Created At', accessor: 'created_at' },
      ]
    : [
        { header: 'Order ID', accessor: 'order_id' },
        { header: 'Client ID', accessor: 'client_id' },
        { header: 'Total Price', accessor: 'total_price' },
        { header: 'Paid', accessor: 'paid' },
        { header: 'Outstanding', accessor: 'outstanding' },
      ];

  // --- Inventory Report Data ---
  let inventoryData: any[] = [];
  if (inventoryReport === 'all') {
    inventoryData = inventory.data || [];
  } else if (inventoryReport === 'lowstock') {
    inventoryData = (inventory.data || []).filter(i => i.low_stock_alert !== null && i.quantity < i.low_stock_alert);
  }
  const inventoryColumns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Low Stock Alert', accessor: 'low_stock_alert' },
    { header: 'Created At', accessor: 'created_at' },
  ];

  // --- Table Renderer ---
  function Table({ data, columns }: { data: any[]; columns: any[] }) {
    if (!data.length) return <div className="text-gray-500 text-sm">No data to display.</div>;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              {columns.map((col: any) => (
                <th key={col.accessor} className="px-3 py-2 border-b bg-gray-50 text-left font-semibold">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} className="even:bg-gray-50">
                {columns.map((col: any) => (
                  <td key={col.accessor} className="px-3 py-2 border-b">
                    {col.accessor === 'total_price' || col.accessor === 'paid' || col.accessor === 'outstanding' || col.accessor === 'amount'
                      ? row[col.accessor] !== undefined && row[col.accessor] !== null
                        ? `₵${(row[col.accessor] / 100).toLocaleString()}`
                        : ''
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Clients */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Clients Summary</h2>
          <select
            className="mb-4 border rounded px-2 py-1 text-sm"
            value={clientReport}
            onChange={e => setClientReport(e.target.value)}
          >
            {clientReports.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="mb-4">
            <Table data={clientData} columns={clientColumns} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <label className="text-sm text-gray-700">Export as:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={clientExportFormat}
              onChange={e => setClientExportFormat(e.target.value as 'csv' | 'pdf')}
              disabled={!clientReport}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <a
              href="#"
              onClick={e => {
                if (!clientReport) { e.preventDefault(); return; }
                clientExportFormat === 'csv'
                  ? exportCSV(clientData, clientColumns, 'clients-report.csv')
                  : exportPDF(clientData, clientColumns, 'clients-report.csv');
              }}
              className={
                !clientReport
                  ? "text-gray-400 cursor-not-allowed pointer-events-none underline text-base font-semibold"
                  : "text-blue-600 hover:text-blue-800 underline text-base font-semibold"
              }
              tabIndex={!clientReport ? -1 : 0}
              aria-disabled={!clientReport}
            >
              {`Export as ${clientExportFormat.toUpperCase()}`}
            </a>
          </div>
          {!clientReport && (
            <div className="text-gray-500 text-sm italic">Select a report to view.</div>
          )}
        </div>
        {/* Orders */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Orders Report</h2>
          <select
            className="mb-4 border rounded px-2 py-1 text-sm"
            value={orderReport}
            onChange={e => setOrderReport(e.target.value)}
          >
            {orderReports.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="mb-4">
            <Table data={orderData} columns={orderColumns} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <label className="text-sm text-gray-700">Export as:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={orderExportFormat}
              onChange={e => setOrderExportFormat(e.target.value as 'csv' | 'pdf')}
              disabled={!orderReport}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <a
              href="#"
              onClick={e => {
                if (!orderReport) { e.preventDefault(); return; }
                orderExportFormat === 'csv'
                  ? exportCSV(orderData, orderColumns, 'orders-report.csv')
                  : exportPDF(orderData, orderColumns, 'orders-report.csv');
              }}
              className={
                !orderReport
                  ? "text-gray-400 cursor-not-allowed pointer-events-none underline text-base font-semibold"
                  : "text-blue-600 hover:text-blue-800 underline text-base font-semibold"
              }
              tabIndex={!orderReport ? -1 : 0}
              aria-disabled={!orderReport}
            >
              {`Export as ${orderExportFormat.toUpperCase()}`}
            </a>
          </div>
          {!orderReport && (
            <div className="text-gray-500 text-sm italic">Select a report to view.</div>
          )}
        </div>
        {/* Payments */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Payments Report</h2>
          <select
            className="mb-4 border rounded px-2 py-1 text-sm"
            value={paymentReport}
            onChange={e => setPaymentReport(e.target.value)}
          >
            {paymentReports.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="mb-4">
            <Table data={paymentData} columns={paymentColumns} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <label className="text-sm text-gray-700">Export as:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={paymentExportFormat}
              onChange={e => setPaymentExportFormat(e.target.value as 'csv' | 'pdf')}
              disabled={!paymentReport}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <a
              href="#"
              onClick={e => {
                if (!paymentReport) { e.preventDefault(); return; }
                paymentExportFormat === 'csv'
                  ? exportCSV(paymentData, paymentColumns, 'payments-report.csv')
                  : exportPDF(paymentData, paymentColumns, 'payments-report.csv');
              }}
              className={
                !paymentReport
                  ? "text-gray-400 cursor-not-allowed pointer-events-none underline text-base font-semibold"
                  : "text-blue-600 hover:text-blue-800 underline text-base font-semibold"
              }
              tabIndex={!paymentReport ? -1 : 0}
              aria-disabled={!paymentReport}
            >
              {`Export as ${paymentExportFormat.toUpperCase()}`}
            </a>
          </div>
          {!paymentReport && (
            <div className="text-gray-500 text-sm italic">Select a report to view.</div>
          )}
        </div>
        {/* Inventory */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Inventory Report</h2>
          <select
            className="mb-4 border rounded px-2 py-1 text-sm"
            value={inventoryReport}
            onChange={e => setInventoryReport(e.target.value)}
          >
            {inventoryReports.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="mb-4">
            <Table data={inventoryData} columns={inventoryColumns} />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <label className="text-sm text-gray-700">Export as:</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={inventoryExportFormat}
              onChange={e => setInventoryExportFormat(e.target.value as 'csv' | 'pdf')}
              disabled={!inventoryReport}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <a
              href="#"
              onClick={e => {
                if (!inventoryReport) { e.preventDefault(); return; }
                inventoryExportFormat === 'csv'
                  ? exportCSV(inventoryData, inventoryColumns, 'inventory-report.csv')
                  : exportPDF(inventoryData, inventoryColumns, 'inventory-report.csv');
              }}
              className={
                !inventoryReport
                  ? "text-gray-400 cursor-not-allowed pointer-events-none underline text-base font-semibold"
                  : "text-blue-600 hover:text-blue-800 underline text-base font-semibold"
              }
              tabIndex={!inventoryReport ? -1 : 0}
              aria-disabled={!inventoryReport}
            >
              {`Export as ${inventoryExportFormat.toUpperCase()}`}
            </a>
          </div>
          {!inventoryReport && (
            <div className="text-gray-500 text-sm italic">Select a report to view.</div>
          )}
        </div>
      </div>
    </div>
  );
} 