import React, { useState, useMemo } from 'react';
import DataTable, { Column, SortState } from './DataTable';
import { trpc } from '../utils/trpc';
import Modal from './Modal';
import toast from 'react-hot-toast';

// Define the shape of an order object (should match your DB schema)
interface Order {
  id: number;
  client_id: number;
  user_id: string;
  description: string | null;
  status: string;
  due_date: string | null;
  total_price: number | null;
  created_at: string;
  updated_at: string;
  notes?: string;
  pendingSync: boolean;
}

// Extend Order for table data to include renderActions
type OrderRow = Order & { renderActions?: () => React.ReactNode };

// 1. Add client type for dropdown and measurements
interface ClientForOrder {
  id: number;
  name: string;
  neck: number | null;
  chest: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  thigh: number | null;
  inseam: number | null;
  arm_length: number | null;
}

// Define allowed statuses for orders
const ORDER_STATUSES = ['pending', 'in-progress', 'extended', 'completed'];

// Define columns for the orders table
const columns: Column<Order>[] = [
  { accessor: 'id', header: 'Order ID' },
  { accessor: 'client_id', header: 'Client ID' },
  {
    accessor: 'description',
    header: 'Description',
    render: (value) => value || '-',
  },
  { accessor: 'status', header: 'Status', render: (value) => value || '-' },
  {
    accessor: 'due_date',
    header: 'Due Date',
    render: (value) => (value ? formatDateBritish(value) : '-'),
  },
  {
    accessor: 'total_price',
    header: 'Total Amount (GHC)',
    render: (value) =>
      typeof value === 'number' && !isNaN(value)
        ? `GHC ${(value / 100).toFixed(2)}`
        : 'GHC —',
  },
  {
    accessor: 'created_at',
    header: 'Created At',
    render: (value) => (value ? formatDateBritish(value) : '-'),
  },
];

// Add Actions column for view button
const columnsWithActions: Column<OrderRow>[] = [
  ...columns,
  {
    accessor: 'renderActions',
    header: 'Actions',
    render: (_, row) => row.renderActions?.(),
  },
];

const defaultSort: SortState<Order> = { column: null, direction: 'asc' };
const defaultRowsPerPage = 10;

function formatDateBritish(dateValue: string | Date) {
  const d = new Date(dateValue);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * OrdersTable fetches and displays real order data using tRPC.
 */
const OrdersTable: React.FC = () => {
  const { data: rawData, isLoading, error } = trpc.getOrders.useQuery();
  
  // Ensure each order has the pendingSync property
  const data = useMemo(() => {
    if (!rawData) return [];
    return rawData.map(order => ({
      ...order,
      pendingSync: false
    }));
  }, [rawData]);

  const utils = trpc.useContext();
  const createOrder = trpc.createOrder.useMutation({
    onSuccess: () => {
      utils.getOrders.invalidate();
      toast.success('Order created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error creating order: ${error.message}`);
    },
  });
  const updateOrder = trpc.updateOrder.useMutation({
    onSuccess: () => {
      utils.getOrders.invalidate();
      toast.success('Order updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error updating order: ${error.message}`);
    },
  });
  const deleteOrder = trpc.deleteOrder.useMutation({
    onSuccess: () => {
      utils.getOrders.invalidate();
      toast.success('Order deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error deleting order: ${error.message}`);
    },
  });
  const bulkDeleteOrders = trpc.bulkDeleteOrders.useMutation({
    onSuccess: () => {
      utils.getOrders.invalidate();
      toast.success('Orders deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error deleting orders: ${error.message}`);
    },
  });
  console.log('OrdersTable data:', data);
  const [sortState, setSortState] = useState<SortState<OrderRow>>(defaultSort);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  // View details modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState<Order | null>(null);
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<Partial<Order>>({
    pendingSync: false,
  });
  // Add new modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  // Fetch all clients for the dropdown
  const { data: clientsData, isLoading: clientsLoading } =
    trpc.getClients.useQuery();
  // Add state for measurements and image upload
  const [addForm, setAddForm] = useState<any>({
    client_id: '',
    status: '',
    description: '',
    due_date: '',
    total_price: '',
    // Measurements
    neck: '',
    chest: '',
    bust: '',
    waist: '',
    hips: '',
    thigh: '',
    inseam: '',
    arm_length: '',
    notes: '',
    pendingSync: false,
  });
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Get unique statuses for the dropdown
  const statusOptions = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.forEach((row) => set.add(row.status));
    return Array.from(set);
  }, [data]);

  // Filtering logic (global search + status filter)
  const filteredData = useMemo(() => {
    if (!data) return [];
    let filtered = data;
    if (statusFilter) {
      filtered = filtered.filter((row) => row.status === statusFilter);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          if (col.accessor === 'renderActions') return false;
          const key = col.accessor as keyof Order;
          if (key in row) {
            const value = row[key as keyof OrderRow];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(term);
          }
          return false;
        })
      );
    }
    return filtered;
  }, [data, search, statusFilter]);

  // Sorting logic (applied after filtering)
  const sortedData = useMemo(() => {
    if (!filteredData) return [];
    if (!sortState.column || sortState.column === 'renderActions')
      return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortState.column as keyof OrderRow];
      const bValue = b[sortState.column as keyof OrderRow];
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return -1;
      if (bValue === null || bValue === undefined) return 1;
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

  // Pagination logic
  const totalRows = sortedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Only add renderActions after all filtering, sorting, and pagination
  const paginatedDataWithActions: OrderRow[] = paginatedData.map((row) => ({
    ...row,
    renderActions: () => (
      <>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={() => {
            setOrderToView(row);
            setViewModalOpen(true);
          }}
        >
          View
        </button>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm ml-2"
          onClick={() => {
            setOrderToEdit(row);
            setEditForm(row);
            setEditModalOpen(true);
          }}
        >
          Edit
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm ml-2"
          onClick={() => {
            setOrderToDelete(row);
            setDeleteModalOpen(true);
          }}
        >
          Delete
        </button>
        {(row as any).pendingSync && (
          <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
            Pending Sync
          </span>
        )}
      </>
    ),
  }));

  // Fix columnsWithBulk: bulkSelect column renders a checkbox for each row, and header has a working 'Select All' checkbox
  const columnsWithBulk: Column<OrderRow>[] = [
    {
      accessor: 'bulkSelect',
      header: (
        <input
          type="checkbox"
          className="align-middle"
          aria-label="Select all"
          checked={
            paginatedDataWithActions.length > 0 &&
            paginatedDataWithActions.every((row) =>
              selectedIds.includes(row.id)
            )
          }
          // @ts-ignore: indeterminate is not a standard prop, but can be set via ref if needed
          indeterminate={
            paginatedDataWithActions.some((row) =>
              selectedIds.includes(row.id)
            ) &&
            !paginatedDataWithActions.every((row) =>
              selectedIds.includes(row.id)
            )
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds((ids) =>
                Array.from(
                  new Set([
                    ...ids,
                    ...paginatedDataWithActions.map((row) => row.id),
                  ])
                )
              );
            } else {
              setSelectedIds((ids) =>
                ids.filter(
                  (id) => !paginatedDataWithActions.some((row) => row.id === id)
                )
              );
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
    },
    ...columnsWithActions.filter((col) => col.accessor !== 'renderActions'),
    // Add the renderActions column back with a valid accessor
    {
      accessor: 'renderActions',
      header:
        columnsWithActions.find((col) => col.accessor === 'renderActions')
          ?.header ?? 'Actions',
      render: (_value, row) => (
        <>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            onClick={() => {
              setOrderToView(row);
              setViewModalOpen(true);
            }}
          >
            View
          </button>
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm ml-2"
            onClick={() => {
              setOrderToEdit(row);
              setEditForm(row);
              setEditModalOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm ml-2"
            onClick={() => {
              setOrderToDelete(row);
              setDeleteModalOpen(true);
            }}
          >
            Delete
          </button>
          {(row as any).pendingSync && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
              Pending Sync
            </span>
          )}
        </>
      ),
    },
  ];

  // Prefill measurements when client changes
  React.useEffect(() => {
    if (!addForm.client_id || !clientsData) return;
    const client = clientsData.find(
      (c: ClientForOrder) => c.id === Number(addForm.client_id)
    );
    if (client) {
      setAddForm((f: any) => ({
        ...f,
        neck: client.neck ?? '',
        chest: client.chest ?? '',
        bust: client.bust ?? '',
        waist: client.waist ?? '',
        hips: client.hips ?? '',
        thigh: client.thigh ?? '',
        inseam: client.inseam ?? '',
        arm_length: client.arm_length ?? '',
      }));
    }
  }, [addForm.client_id, clientsData]);

  // Handle image upload
  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }
      setAddImage(file);
      setAddImagePreview(URL.createObjectURL(file));
      toast.success('Image selected!');
    }
  };

  // Handlers
  const handleSort = (column: keyof OrderRow) => {
    if (column === 'renderActions') return;
    setSortState((prev) => {
      if (prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'asc' };
    });
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Reset to page 1 if search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage, sortState]);

  // At the top of OrdersTable, count unsynced orders
  const pendingCount = (data || []).filter(
    (o) => (o as any).pendingSync
  ).length;

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      {pendingCount > 0 && (
        <div className="mb-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 flex items-center gap-2">
          <span className="font-semibold">
            {pendingCount} order{pendingCount > 1 ? 's' : ''} pending sync
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
              client_id: '',
              status: '',
              description: '',
              due_date: '',
              total_price: '',
              neck: '',
              chest: '',
              bust: '',
              waist: '',
              hips: '',
              thigh: '',
              inseam: '',
              arm_length: '',
              notes: '',
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
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="w-full max-w-xs px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columnsWithBulk}
        data={paginatedDataWithActions}
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
            Showing {paginatedData.length} of {totalRows} orders
          </span>
        </div>
      </div>
      {/* View Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setOrderToView(null);
        }}
        title="Order Details"
        actions={
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => {
              setViewModalOpen(false);
              setOrderToView(null);
            }}
          >
            Close
          </button>
        }
      >
        {orderToView ? (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Order ID:</span> {orderToView.id}{' '}
              {(orderToView as any).pendingSync && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
                  Pending Sync
                </span>
              )}
            </div>
            <div>
              <span className="font-semibold">Client ID:</span>{' '}
              {orderToView.client_id}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{' '}
              {orderToView.status}
            </div>
            <div>
              <span className="font-semibold">Description:</span>{' '}
              {orderToView.description || '—'}
            </div>
            <div>
              <span className="font-semibold">Due Date:</span>{' '}
              {orderToView.due_date
                ? formatDateBritish(orderToView.due_date)
                : '—'}
            </div>
            <div>
              <span className="font-semibold">Total Price:</span>{' '}
              {orderToView.total_price !== null
                ? `₵${(orderToView.total_price / 100).toFixed(2)}`
                : '—'}
            </div>
            <div>
              <span className="font-semibold">Created At:</span>{' '}
              {formatDateBritish(orderToView.created_at)}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span>{' '}
              {formatDateBritish(orderToView.updated_at)}
            </div>
          </div>
        ) : null}
      </Modal>
      {/* Edit Order Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setOrderToEdit(null);
          setEditForm({ pendingSync: false });
        }}
        title="Edit Order"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setEditModalOpen(false);
                setOrderToEdit(null);
                setEditForm({ pendingSync: false });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              onClick={async () => {
                if (!orderToEdit) return;
                try {
                  await updateOrderMutation.mutateAsync({
                    id: orderToEdit.id,
                    status: editForm.status,
                    description: editForm.description,
                    // Add other fields as needed
                  });
                  toast.success('Order updated successfully!');
                  setEditModalOpen(false);
                  setOrderToEdit(null);
                  setEditForm({ pendingSync: false });
                  // Refetch orders to update the UI
                  if (typeof window !== 'undefined') {
                    window.location.reload(); // Quick fix: reload page to see changes
                  }
                  // For a better UX, you could use trpc context to refetch orders without reload
                } catch (err) {
                  toast.error('Failed to update order.');
                }
              }}
            >
              Save
            </button>
          </>
        }
      >
        {orderToEdit ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={editForm.status ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, status: e.target.value }))
                }
                required
              >
                <option value="">Select status</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Description</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editForm.description ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            {/* Add more fields as needed */}
          </form>
        ) : null}
      </Modal>
      {/* Add New Order Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddForm({
            client_id: '',
            status: '',
            description: '',
            due_date: '',
            total_price: '',
            neck: '',
            chest: '',
            bust: '',
            waist: '',
            hips: '',
            thigh: '',
            inseam: '',
            arm_length: '',
            notes: '',
            pendingSync: false,
          });
          setAddImage(null);
          setAddImagePreview(null);
        }}
        title="Add New Order"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setAddModalOpen(false);
                setAddForm({
                  client_id: '',
                  status: '',
                  description: '',
                  due_date: '',
                  total_price: '',
                  neck: '',
                  chest: '',
                  bust: '',
                  waist: '',
                  hips: '',
                  thigh: '',
                  inseam: '',
                  arm_length: '',
                  notes: '',
                  pendingSync: false,
                });
                setAddImage(null);
                setAddImagePreview(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={async () => {
                // Validate required fields
                if (
                  !addForm.client_id ||
                  !addForm.status ||
                  !addForm.due_date ||
                  !addForm.total_price
                ) {
                  toast.error('Please fill in all required fields.');
                  return;
                }
                let imageUrl = '';
                if (addImage) {
                  // Upload the image to the API route
                  const formData = new FormData();
                  formData.append('file', addImage);
                  try {
                    const res = await fetch('/api/upload-order-image', {
                      method: 'POST',
                      body: formData,
                    });
                    const data = await res.json();
                    if (res.ok && data.url) {
                      imageUrl = data.url;
                      toast.success('Image uploaded!');
                    } else {
                      toast.error('Image upload failed.');
                      return;
                    }
                  } catch (err) {
                    toast.error('Image upload error.');
                    return;
                  }
                }
                // Create the order with all fields, including image_url
                try {
                  await createOrderMutation.mutateAsync({
                    ...addForm,
                    client_id: Number(addForm.client_id),
                    total_price: Number(addForm.total_price),
                    image_url: imageUrl,
                  });
                  toast.success(`Order added successfully!`);
                  setAddModalOpen(false);
                  setAddForm({
                    client_id: '',
                    status: '',
                    description: '',
                    due_date: '',
                    total_price: '',
                    neck: '',
                    chest: '',
                    bust: '',
                    waist: '',
                    hips: '',
                    thigh: '',
                    inseam: '',
                    arm_length: '',
                    notes: '',
                    pendingSync: false,
                  });
                  setAddImage(null);
                  setAddImagePreview(null);
                } catch (err) {
                  toast.error('Failed to add order.');
                }
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
          {/* Client Dropdown */}
          <div>
            <label className="block font-semibold mb-1">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded px-2 py-1"
              value={addForm.client_id}
              onChange={(e) =>
                setAddForm((f: any) => ({ ...f, client_id: e.target.value }))
              }
              required
            >
              <option value="">Select a client</option>
              {clientsData &&
                clientsData.map((c: ClientForOrder) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={addForm.description ?? ''}
              onChange={(e) =>
                setAddForm((f: any) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          {/* Status */}
          <div>
            <label className="block font-semibold mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded px-2 py-1"
              value={addForm.status ?? ''}
              onChange={(e) =>
                setAddForm((f: any) => ({ ...f, status: e.target.value }))
              }
              required
            >
              <option value="">Select status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {/* Due Date */}
          <div>
            <label className="block font-semibold mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1"
              value={addForm.due_date ?? ''}
              onChange={(e) =>
                setAddForm((f: any) => ({ ...f, due_date: e.target.value }))
              }
              required
            />
          </div>
          {/* Amount */}
          <div>
            <label className="block font-semibold mb-1">
              Total Price (GHC) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={addForm.total_price ?? ''}
              onChange={(e) =>
                setAddForm((f: any) => ({ ...f, total_price: e.target.value }))
              }
              required
              min="0"
            />
          </div>
          {/* Measurements */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium">Neck</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={addForm.neck ?? ''}
                onChange={(e) =>
                  setAddForm((f: any) => ({ ...f, neck: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Chest</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={addForm.chest ?? ''}
                onChange={(e) =>
                  setAddForm((f: any) => ({ ...f, chest: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Bust</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={addForm.bust ?? ''}
                onChange={(e) =>
                  setAddForm((f: any) => ({ ...f, bust: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Waist</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={addForm.waist ?? ''}
                onChange={(e) =>
                  setAddForm((f: any) => ({ ...f, waist: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Hips</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={addForm.hips ?? ''}
                onChange={(e) =>
                  setAddForm((f: any) => ({ ...f, hips: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Thigh</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={addForm.thigh ?? ''}
                onChange={(e) =>
                  setAddForm((f: any) => ({ ...f, thigh: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Inseam</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={addForm.inseam ?? ''}
                onChange={(e) =>
                  setAddForm((f: any) => ({ ...f, inseam: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Arm Length</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={addForm.arm_length ?? ''}
                onChange={(e) =>
                  setAddForm((f: any) => ({ ...f, arm_length: e.target.value }))
                }
              />
            </div>
          </div>
          {/* Notes field */}
          <div>
            <label className="block font-semibold mb-1">Notes</label>
            <textarea
              className="w-full border rounded px-2 py-1"
              value={addForm.notes ?? ''}
              onChange={(e) =>
                setAddForm((f: any) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
            />
          </div>
          {/* Image Upload */}
          <div>
            <label className="block font-semibold mb-1">
              Order Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAddImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {addImagePreview && (
              <img
                src={addImagePreview}
                alt="Order Preview"
                className="mt-3 h-20 object-contain rounded border"
              />
            )}
          </div>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        title="Confirm Delete"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setDeleteModalOpen(false);
                setOrderToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                toast.success(`Order deleted successfully!`);
                setDeleteModalOpen(false);
                setOrderToDelete(null);
              }}
            >
              Delete
            </button>
          </>
        }
      >
        {orderToDelete ? (
          <p>
            Are you sure you want to delete order{' '}
            <span className="font-semibold">{orderToDelete.id}</span>?
          </p>
        ) : null}
      </Modal>
      {/* Bulk Delete Modal */}
      <Modal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Delete Selected Orders"
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
                  `${selectedIds.length} order(s) deleted successfully!`
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
          order(s)?
        </div>
      </Modal>
    </div>
  );
};

export default OrdersTable;
