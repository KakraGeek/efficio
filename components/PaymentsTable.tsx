import React, { useState, useMemo } from 'react';
import DataTable, { Column, SortState } from './DataTable';
import { trpc } from '../utils/trpc';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { formatDateBritish } from '../lib/utils';

// Define the shape of a payment object (should match your DB schema)
interface Payment {
  id: number;
  user_id: string;
  order_id: number;
  amount: number;
  method: string;
  status: string | null;
  transaction_ref: string | null;
  created_at: string;
  // Add these optional fields for UI/extra data
  payment_type: string | null;
  payment_balance: number | null;
  pendingSync: boolean;
}

// Extend Payment for table data to include renderActions
type PaymentRow = Payment & { renderActions?: () => React.ReactNode };

const PaymentsTable: React.FC = () => {
  const { data: rawData, isLoading, error } = trpc.getPayments.useQuery();

  // Ensure each payment has the pendingSync property and correct types
  const data = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((payment) => ({
      ...payment,
      payment_type: payment.payment_type || null,
      payment_balance: payment.payment_balance || null,
      pendingSync: false,
    }));
  }, [rawData]);

  const { data: ordersData } = trpc.getOrders.useQuery();
  const { data: clientsData } = trpc.getClients.useQuery();
  const utils = trpc.useContext();
  const createPayment = trpc.createPayment.useMutation({
    onSuccess: () => {
      utils.getPayments.invalidate();
      toast.success('Payment created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error creating payment: ${error.message}`);
    },
  });
  const updatePayment = trpc.updatePayment.useMutation({
    onSuccess: () => {
      utils.getPayments.invalidate();
      toast.success('Payment updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error updating payment: ${error.message}`);
    },
  });
  const deletePayment = trpc.deletePayment.useMutation({
    onSuccess: () => {
      utils.getPayments.invalidate();
      toast.success('Payment deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error deleting payment: ${error.message}`);
    },
  });
  const bulkDeletePayments = trpc.bulkDeletePayments.useMutation({
    onSuccess: () => {
      utils.getPayments.invalidate();
      toast.success('Payments deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error deleting payments: ${error.message}`);
    },
  });
  console.log('PaymentsTable data:', data);

  const defaultSort = {
    column: null as string | null,
    direction: 'asc' as 'asc' | 'desc',
  };
  const defaultRowsPerPage = 10;

  const [sortState, setSortState] = useState<typeof defaultSort>(defaultSort);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  // View details modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [paymentToView, setPaymentToView] = useState<Payment | null>(null);
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState<
    Partial<Payment> & { amount_input?: string }
  >({
    pendingSync: false,
    amount_input: '',
  });
  // Add new modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<
    Partial<Payment> & { amount_input?: string }
  >({
    amount: 0,
    amount_input: '',
    method: '',
    pendingSync: false,
  });
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Get unique methods for the dropdown
  const methodOptions = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.forEach((row) => {
      if (row.method) set.add(row.method);
    });
    return Array.from(set);
  }, [data]);

  // Define columns first
  const columns = useMemo<Column<PaymentRow>[]>(
    () => [
      { accessor: 'id', header: 'Payment ID' },
      { accessor: 'order_id', header: 'Order ID' },
      {
        accessor: 'amount',
        header: 'Amount (GHS)',
        render: (value: number) =>
          typeof value === 'number' && !isNaN(value)
            ? `GHS ${(value / 100).toFixed(2)}`
            : 'GHS —',
      },
      {
        accessor: 'method',
        header: 'Method',
        render: (value: string) => value || '-',
      },
      {
        accessor: 'status',
        header: 'Status',
        render: (_value: string | null, row: PaymentRow) => {
          const order = ordersData?.find((o) => o.id === row.order_id);
          return order ? order.status : '—';
        },
      },
      {
        accessor: 'transaction_ref',
        header: 'Transaction Ref',
        render: (value: string | null) => value || '-',
      },
      {
        accessor: 'created_at',
        header: 'Date',
        render: (value: string) => (value ? formatDateBritish(value) : '-'),
      },
    ],
    [ordersData]
  );

  // Filtering logic (global search + method filter)
  const filteredData = useMemo(() => {
    let filtered = data;
    if (methodFilter) {
      filtered = filtered.filter((row) => row.method === methodFilter);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          if (col.accessor === 'renderActions') return false;
          if (
            typeof col.accessor === 'string' &&
            (col.accessor as keyof Payment) in row
          ) {
            const value = row[col.accessor as keyof Payment];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(term);
          }
          return false;
        })
      );
    }
    return filtered;
  }, [data, search, methodFilter, columns]);

  // Sorting logic (applied after filtering)
  const sortedData = useMemo(() => {
    if (!filteredData) return [];
    if (!sortState.column) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      // Handle renderActions column separately
      if (sortState.column === 'renderActions') return 0;

      const aValue = a[sortState.column as keyof Payment];
      const bValue = b[sortState.column as keyof Payment];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      return sortState.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return sorted;
  }, [filteredData, sortState]);

  // Add renderActions to each row
  const dataWithActions: PaymentRow[] = useMemo(() => {
    return sortedData.map((row) => ({
      ...row,
      renderActions: () => (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            onClick={() => {
              setPaymentToView(row);
              setViewModalOpen(true);
            }}
          >
            View
          </button>
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            onClick={() => {
              setPaymentToEdit(row);
              setEditForm(row);
              setEditModalOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            onClick={() => {
              setPaymentToDelete(row);
              setDeleteModalOpen(true);
            }}
          >
            Delete
          </button>
          {row.pendingSync && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
              Pending Sync
            </span>
          )}
        </div>
      ),
    }));
  }, [sortedData]);

  // Pagination logic
  const totalRows = dataWithActions.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return dataWithActions.slice(start, start + rowsPerPage);
  }, [dataWithActions, currentPage, rowsPerPage]);

  // Bulk selection column with working select-all and indeterminate state
  const selectAllRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (selectAllRef.current) {
      const allSelected =
        paginatedData.length > 0 &&
        paginatedData.every((row) => selectedIds.includes(row.id));
      const someSelected = paginatedData.some((row) =>
        selectedIds.includes(row.id)
      );
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [paginatedData, selectedIds]);

  // Bulk selection column
  const bulkSelectColumn: Column<PaymentRow> = {
    accessor: 'bulkSelect',
    header: (
      <input
        type="checkbox"
        className="align-middle"
        aria-label="Select all"
        ref={selectAllRef}
        checked={
          paginatedData.length > 0 &&
          paginatedData.every((row) => selectedIds.includes(row.id))
        }
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedIds(paginatedData.map((row) => row.id));
          } else {
            setSelectedIds([]);
          }
        }}
      />
    ),
    render: (_value, row) => (
      <input
        type="checkbox"
        checked={selectedIds.includes(row.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedIds((ids) => [...ids, row.id]);
          } else {
            setSelectedIds((ids) => ids.filter((id) => id !== row.id));
          }
        }}
        className="align-middle"
        aria-label="Select row"
      />
    ),
  };

  // Actions column
  const actionsColumn: Column<PaymentRow> = {
    accessor: 'renderActions',
    header: 'Actions',
    render: (_, row) => row.renderActions?.(),
  };

  // Combine for table
  const columnsWithBulkAndActions: Column<PaymentRow>[] = [
    bulkSelectColumn,
    ...columns,
    actionsColumn,
  ];

  // Type guard to check if a value is a key of PaymentRow
  function isPaymentKey(key: unknown): key is keyof PaymentRow {
    return (
      typeof key === 'string' &&
      [
        'id',
        'user_id',
        'order_id',
        'amount',
        'method',
        'status',
        'transaction_ref',
        'created_at',
        'payment_type',
        'payment_balance',
        'pendingSync',
      ].includes(key)
    );
  }

  // Handlers
  const handleSort = (column: string) => {
    // Only allow sorting on valid columns
    if (isPaymentKey(column)) {
      setSortState((prev) => {
        if (prev.column === column) {
          return {
            column,
            direction: prev.direction === 'asc' ? 'desc' : 'asc',
          };
        }
        return { column, direction: 'asc' };
      });
    }
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };
  const handleMethodFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setMethodFilter(e.target.value);
    setCurrentPage(1);
  };

  // Reset to page 1 if search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage, sortState]);

  // At the top of PaymentsTable, count unsynced payments
  const pendingCount = (data || []).filter((p) => p.pendingSync).length;

  if (isLoading) return <div>Loading payments...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      {pendingCount > 0 && (
        <div className="mb-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 flex items-center gap-2">
          <span className="font-semibold">
            {pendingCount} payment{pendingCount > 1 ? 's' : ''} pending sync
          </span>
          <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
            Pending Sync
          </span>
        </div>
      )}
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => {
            setAddForm({
              amount: 0,
              amount_input: '',
              method: '',
              status: '',
              transaction_ref: '',
              pendingSync: false,
            });
            setAddModalOpen(true);
          }}
        >
          Add New
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 ml-2"
          disabled={selectedIds.length === 0}
          onClick={() => setBulkDeleteModalOpen(true)}
        >
          Delete Selected
        </button>
        {selectedIds.length > 0 && (
          <span className="text-sm text-gray-600 ml-2">
            {selectedIds.length} selected
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search payments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
        />
        <select
          value={methodFilter}
          onChange={handleMethodFilterChange}
          className="w-full max-w-xs px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
        >
          <option value="">All Methods</option>
          {methodOptions.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columnsWithBulkAndActions}
        data={paginatedData}
        onSort={handleSort}
        sortState={sortState}
      />
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
        <div>
          <button
            className="px-3 py-1 border rounded mr-2 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 border rounded mx-1 ${page === currentPage ? 'bg-blue-100 font-bold' : ''}`}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
            >
              {page}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded ml-2 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-sm text-gray-600">
            Showing {paginatedData.length} of {totalRows} payments
          </span>
        </div>
      </div>
      {/* View Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setPaymentToView(null);
        }}
        title="Payment Details"
        actions={
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => {
              setViewModalOpen(false);
              setPaymentToView(null);
            }}
          >
            Close
          </button>
        }
      >
        {paymentToView ? (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Payment ID:</span>{' '}
              {paymentToView.id}
              {paymentToView.pendingSync && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
                  Pending Sync
                </span>
              )}
            </div>
            <div>
              <span className="font-semibold">Order ID:</span>{' '}
              {paymentToView.order_id}
            </div>
            <div>
              <span className="font-semibold">Customer Name:</span>{' '}
              {(() => {
                if (!ordersData || !clientsData) return '—';
                const order = ordersData.find(
                  (o) => o.id === paymentToView.order_id
                );
                if (!order) return '—';
                const client = clientsData.find(
                  (c) => c.id === order.client_id
                );
                return client ? client.name : '—';
              })()}
            </div>
            <div>
              <span className="font-semibold">Amount:</span>{' '}
              {paymentToView.amount
                ? `GHS ${(paymentToView.amount / 100).toFixed(2)}`
                : 'GHS —'}
            </div>
            <div>
              <span className="font-semibold">Method:</span>{' '}
              {paymentToView.method}
            </div>
            {/* Show Payment Type if present */}
            <div>
              <span className="font-semibold">Payment Type:</span>{' '}
              {paymentToView.payment_type || '—'}
            </div>
            {/* Show Payment Balance if present */}
            <div>
              <span className="font-semibold">Payment Balance:</span>{' '}
              {typeof paymentToView.payment_balance === 'number'
                ? `GHS ${paymentToView.payment_balance}`
                : '—'}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              {(() => {
                if (!ordersData) return '—';
                const order = ordersData.find(
                  (o) => o.id === paymentToView.order_id
                );
                return order ? order.status : '—';
              })()}
            </div>
            <div>
              <span className="font-semibold">Transaction Ref:</span>{' '}
              {paymentToView.transaction_ref || '—'}
            </div>
            <div>
              <span className="font-semibold">Created At:</span>{' '}
              {formatDateBritish(paymentToView.created_at)}
            </div>
          </div>
        ) : null}
      </Modal>
      {/* Edit Payment Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setPaymentToEdit(null);
          setEditForm({ pendingSync: false, amount_input: '' });
        }}
        title="Edit Payment"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setEditModalOpen(false);
                setPaymentToEdit(null);
                setEditForm({ pendingSync: false, amount_input: '' });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              onClick={() => {
                if (!paymentToEdit) return;
                updatePayment.mutate({
                  id: paymentToEdit.id,
                  ...editForm,
                  amount:
                    editForm.amount_input !== undefined &&
                    editForm.amount_input !== ''
                      ? Math.round(Number(editForm.amount_input) * 100)
                      : undefined,
                });
                setEditModalOpen(false);
                setPaymentToEdit(null);
                setEditForm({ pendingSync: false, amount_input: '' });
              }}
            >
              Save
            </button>
          </>
        }
      >
        {paymentToEdit ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div>
              <label className="block font-semibold mb-1">Amount (GHS)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-2 py-1"
                value={editForm.amount_input ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    amount_input: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Method</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editForm.method ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, method: e.target.value }))
                }
              />
            </div>
            {/* Add more fields as needed */}
          </form>
        ) : null}
      </Modal>
      {/* Add New Payment Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddForm({
            amount: 0,
            amount_input: '',
            method: '',
            status: '',
            transaction_ref: '',
            pendingSync: false,
          });
        }}
        title="Add New Payment"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setAddModalOpen(false);
                setAddForm({
                  amount: 0,
                  amount_input: '',
                  method: '',
                  status: '',
                  transaction_ref: '',
                  pendingSync: false,
                });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                if (
                  !addForm.amount_input ||
                  !addForm.method ||
                  !addForm.order_id
                ) {
                  toast.error('Order, amount and payment method are required');
                  return;
                }
                createPayment.mutate({
                  order_id: addForm.order_id,
                  amount: Math.round(Number(addForm.amount_input) * 100),
                  method: addForm.method,
                  status: addForm.status || undefined,
                  transaction_ref: addForm.transaction_ref || undefined,
                  payment_type: addForm.payment_type || undefined,
                  payment_balance: addForm.payment_balance ?? undefined,
                });
                setAddModalOpen(false);
                setAddForm({
                  order_id: undefined,
                  amount: 0,
                  amount_input: '',
                  method: '',
                  status: '',
                  transaction_ref: '',
                  payment_type: '',
                  payment_balance: undefined,
                  pendingSync: false,
                });
              }}
            >
              Add
            </button>
          </>
        }
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {/* Amount input */}
          <div>
            <label className="block font-semibold mb-1">Amount (GHS)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded px-2 py-1"
              value={addForm.amount_input ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  amount_input: e.target.value,
                }))
              }
            />
          </div>
          {/* Order dropdown */}
          <div>
            <label className="block font-semibold mb-1">Order</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={addForm.order_id ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, order_id: Number(e.target.value) }))
              }
            >
              <option value="">Select an order</option>
              {ordersData &&
                ordersData.map((order) => {
                  // Find the client for this order
                  const client = clientsData
                    ? clientsData.find((c) => c.id === order.client_id)
                    : null;
                  return (
                    <option key={order.id} value={order.id}>
                      Order #{order.id} -{' '}
                      {order.description || order.status || 'No description'}
                      {client ? ` (Customer: ${client.name})` : ''}
                    </option>
                  );
                })}
            </select>
          </div>
          {/* Method dropdown */}
          <div>
            <label className="block font-semibold mb-1">Method</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={addForm.method ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, method: e.target.value }))
              }
            >
              <option value="">Select a method</option>
              {methodOptions.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          {/* Payment Type dropdown */}
          <div>
            <label className="block font-semibold mb-1">Payment Type</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={addForm.payment_type ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, payment_type: e.target.value }))
              }
            >
              <option value="">Select payment type</option>
              <option value="Full payment">Full payment</option>
              <option value="Deposit">Deposit</option>
            </select>
          </div>
          {/* Payment Balance input */}
          <div>
            <label className="block font-semibold mb-1">
              Payment Balance (GHS)
            </label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={addForm.payment_balance ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  payment_balance: Number(e.target.value),
                }))
              }
              placeholder="Enter payment balance"
            />
          </div>
          {/* Transaction Ref input */}
          <div>
            <label className="block font-semibold mb-1">Transaction Ref</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={addForm.transaction_ref ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, transaction_ref: e.target.value }))
              }
              placeholder="Enter transaction reference"
            />
          </div>
          {/* Add more fields as needed */}
        </form>
      </Modal>
      {/* Delete Payment Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPaymentToDelete(null);
        }}
        title="Delete Payment"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setDeleteModalOpen(false);
                setPaymentToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                toast.success(`Payment deleted successfully!`);
                setDeleteModalOpen(false);
                setPaymentToDelete(null);
              }}
            >
              Delete
            </button>
          </>
        }
      >
        {paymentToDelete ? (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Payment ID:</span>{' '}
              {paymentToDelete.id}
            </div>
            <div>
              <span className="font-semibold">Order ID:</span>{' '}
              {paymentToDelete.order_id}
            </div>
            <div>
              <span className="font-semibold">Amount:</span>{' '}
              {paymentToDelete.amount
                ? `GHS ${(paymentToDelete.amount / 100).toFixed(2)}`
                : 'GHS —'}
            </div>
            <div>
              <span className="font-semibold">Method:</span>{' '}
              {paymentToDelete.method}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              {paymentToDelete.status || '—'}
            </div>
            <div>
              <span className="font-semibold">Transaction Ref:</span>{' '}
              {paymentToDelete.transaction_ref || '—'}
            </div>
            <div>
              <span className="font-semibold">Created At:</span>{' '}
              {formatDateBritish(paymentToDelete.created_at)}
            </div>
          </div>
        ) : null}
      </Modal>
      {/* Bulk Delete Modal */}
      <Modal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Delete Selected Payments"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => setBulkDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                toast.success(
                  `${selectedIds.length} payment(s) deleted successfully!`
                );
                setBulkDeleteModalOpen(false);
                setSelectedIds([]);
              }}
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="py-4 text-center">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{selectedIds.length}</span> selected
          payment(s)?
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsTable;
