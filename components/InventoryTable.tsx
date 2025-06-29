import React, { useState, useMemo } from 'react';
import DataTable, { Column, SortState } from './DataTable';
import Modal from './Modal';
import { trpc } from '../utils/trpc';
import toast from 'react-hot-toast';

// Define the shape of an inventory item (should match your DB schema)
interface InventoryItem {
  id: number;
  user_id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  low_stock_alert: number | null;
  created_at: string;
  updated_at: string;
  pendingSync: boolean;
}

// Extend InventoryItem for table data to include renderActions
type InventoryRow = InventoryItem & { renderActions?: () => React.ReactNode };

type InventorySortKey = keyof InventoryItem | 'renderActions';

// Define columns for the inventory table
const columns: Column<InventoryRow>[] = [
  { accessor: 'id', header: 'Item ID' },
  { accessor: 'name', header: 'Item Name', render: (value) => value || '-' },
  { accessor: 'category', header: 'Category', render: (value) => value || '-' },
  {
    accessor: 'quantity',
    header: 'Quantity',
    render: (value, row) => {
      const isLowStock =
        typeof row.low_stock_alert === 'number' && value <= row.low_stock_alert;
      return (
        <span>
          {value}
          {isLowStock && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded">
              Low Stock!
            </span>
          )}
        </span>
      );
    },
  },
  { accessor: 'unit', header: 'Unit', render: (value) => value || '-' },
  {
    accessor: 'low_stock_alert',
    header: 'Low Stock Alert',
    render: (value) => value ?? '-',
  },
  {
    accessor: 'created_at',
    header: 'Created At',
    render: (value) => (value ? formatDateBritish(value) : '-'),
  },
  {
    accessor: 'renderActions',
    header: 'Actions',
    render: (_, row) => row.renderActions?.(),
  },
];

const defaultSort = {
  column: null as string | null,
  direction: 'asc' as 'asc' | 'desc',
};
const defaultRowsPerPage = 10;

// Helper type guard to check if a value is a key of InventoryItem
function isInventoryItemKey(
  key: string | number | symbol
): key is keyof InventoryItem {
  return [
    'id',
    'user_id',
    'name',
    'category',
    'quantity',
    'unit',
    'low_stock_alert',
    'created_at',
    'updated_at',
    'pendingSync',
  ].includes(key as string);
}

function formatDateBritish(dateValue: string | Date) {
  const d = new Date(dateValue);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * InventoryTable fetches and displays real inventory data using tRPC.
 */
const InventoryTable: React.FC = () => {
  const { data: rawData, isLoading, error } = trpc.getInventory.useQuery();

  // Ensure each item has the pendingSync property
  const data = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((item) => ({
      ...item,
      pendingSync: false,
    }));
  }, [rawData]);

  const utils = trpc.useContext();
  const createInventoryItem = trpc.createInventoryItem.useMutation({
    onSuccess: () => {
      utils.getInventory.invalidate();
      toast.success('Item created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error creating item: ${error.message}`);
    },
  });
  const updateInventoryItem = trpc.updateInventory.useMutation({
    onSuccess: () => {
      utils.getInventory.invalidate();
      toast.success('Item updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error updating item: ${error.message}`);
    },
  });
  const deleteInventoryItem = trpc.deleteInventoryItem.useMutation({
    onSuccess: () => {
      utils.getInventory.invalidate();
      toast.success('Item deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error deleting item: ${error.message}`);
    },
  });
  const bulkDeleteInventory = trpc.bulkDeleteInventory.useMutation({
    onSuccess: () => {
      utils.getInventory.invalidate();
      toast.success('Items deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error deleting items: ${error.message}`);
    },
  });
  const removeInventoryQuantity = trpc.updateInventory.useMutation({
    onSuccess: () => {
      utils.getInventory.invalidate();
      toast.success('Inventory updated successfully!');
      setRemoveModalOpen(false);
      setRemoveQuantity('');
      setRemoveError('');
    },
    onError: (error: any) => {
      setRemoveError(error.message || 'Error updating inventory.');
    },
  });
  console.log('InventoryTable data:', data);
  const [sortState, setSortState] = useState<typeof defaultSort>(defaultSort);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  // View details modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [itemToView, setItemToView] = useState<InventoryItem | null>(null);
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({
    pendingSync: false,
  });
  // Add new modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    low_stock_alert: undefined,
    pendingSync: false,
  });
  // Mark as Low Stock modal state
  const [lowStockModalOpen, setLowStockModalOpen] = useState(false);
  const [itemToMarkLowStock, setItemToMarkLowStock] =
    useState<InventoryItem | null>(null);
  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  // Add these new state variables near your other modal states
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<InventoryItem | null>(null);
  // Add these new state variables near your other modal states
  const [removeQuantity, setRemoveQuantity] = useState('');
  const [removeError, setRemoveError] = useState('');
  // Add this state near your other modal states
  const [addCategoryOther, setAddCategoryOther] = useState('');
  // Add this state near your other modal states
  const [editCategoryOther, setEditCategoryOther] = useState('');

  // Get unique categories for the dropdown
  const categoryOptions = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.forEach((row) => {
      if (row.category) {
        // Normalize both 'accessory' and 'accessories' to 'Accessories'
        let cat = row.category.trim().toLowerCase();
        if (cat === 'accessory' || cat === 'accessories') {
          set.add('Accessories');
        } else {
          set.add(row.category);
        }
      }
    });
    return Array.from(set);
  }, [data]);

  // Filtering logic (global search + category filter)
  const filteredData: InventoryItem[] = useMemo(() => {
    if (!data) return [];
    let filtered = data;
    if (categoryFilter) {
      filtered = filtered.filter((row) => row.category === categoryFilter);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((row) => {
        // Only use columns whose accessor is a key of InventoryItem
        const filterableColumns = columns.filter((col) =>
          isInventoryItemKey(col.accessor)
        ) as Column<InventoryItem>[];
        return filterableColumns.some((col) => {
          const key = col.accessor as keyof InventoryItem;
          // Cast row to InventoryItem to handle optional properties
          const typedRow = row as InventoryItem;
          const value = typedRow[key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(term);
        });
      });
    }
    return filtered;
  }, [data, search, categoryFilter]);

  // Sorting logic (applied after filtering)
  const sortedData: InventoryItem[] = useMemo(() => {
    if (!filteredData) return [];
    // Prevent sorting on the Actions column
    if (!sortState.column || sortState.column === 'renderActions')
      return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortState.column as keyof InventoryItem];
      const bValue = b[sortState.column as keyof InventoryItem];
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

  // Pagination logic
  const totalRows = sortedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedData: InventoryItem[] = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Only add renderActions after all filtering, sorting, and pagination
  const paginatedDataWithActions: InventoryRow[] = paginatedData.map((row) => ({
    ...row,
    renderActions: () => (
      <div className="flex gap-2">
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
          className="mr-2 align-middle"
          aria-label="Select row"
        />
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={() => {
            setItemToView(row);
            setViewModalOpen(true);
          }}
        >
          View
        </button>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          onClick={() => {
            setItemToEdit(row);
            setEditForm(row);
            setEditModalOpen(true);
          }}
        >
          Edit
        </button>
        {row.low_stock_alert !== null && row.quantity < row.low_stock_alert && (
          <button
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            onClick={() => {
              setItemToMarkLowStock(row);
              setLowStockModalOpen(true);
            }}
          >
            Mark as Low Stock
          </button>
        )}
        <button
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          onClick={() => {
            setItemToDelete(row);
            setModalOpen(true);
          }}
        >
          Delete
        </button>
        {row.pendingSync && (
          <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
            Pending Sync
          </span>
        )}
        <button
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          onClick={() => {
            setItemToRemove(row);
            setRemoveModalOpen(true);
          }}
        >
          Remove
        </button>
      </div>
    ),
  }));

  // Fix columnsWithBulk: bulkSelect column renders a checkbox for each row, and header has a working 'Select All' checkbox
  const columnsWithBulk: Column<InventoryRow>[] = [
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
    ...columns.filter((col) => col.accessor !== 'renderActions'),
    // Add the renderActions column back with a valid accessor
    {
      accessor: 'renderActions',
      header:
        columns.find((col) => col.accessor === 'renderActions')?.header ??
        'Actions',
      render: (_value, row) => (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            onClick={() => {
              setItemToView(row);
              setViewModalOpen(true);
            }}
          >
            View
          </button>
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            onClick={() => {
              setItemToEdit(row);
              setEditForm(row);
              setEditModalOpen(true);
            }}
          >
            Edit
          </button>
          {row.low_stock_alert !== null &&
            row.quantity < row.low_stock_alert && (
              <button
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                onClick={() => {
                  setItemToMarkLowStock(row);
                  setLowStockModalOpen(true);
                }}
              >
                Mark as Low Stock
              </button>
            )}
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            onClick={() => {
              setItemToDelete(row);
              setModalOpen(true);
            }}
          >
            Delete
          </button>
          {row.pendingSync && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
              Pending Sync
            </span>
          )}
          <button
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            onClick={() => {
              setItemToRemove(row);
              setRemoveModalOpen(true);
            }}
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  // Handlers
  const handleSort = (column: string) => {
    // Only allow sorting on valid columns
    if (isInventoryItemKey(column)) {
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
  const handleCategoryFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  // Placeholder delete function
  const handleDelete = () => {
    if (!itemToDelete) return;
    deleteInventoryItem.mutate({ id: itemToDelete.id });
    setModalOpen(false);
    setItemToDelete(null);
  };

  // Reset to page 1 if search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage, sortState]);

  // At the top of InventoryTable, count unsynced items
  const pendingCount = (data || []).filter((i) => i.pendingSync).length;

  if (isLoading) return <div>Loading inventory...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      {pendingCount > 0 && (
        <div className="mb-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 flex items-center gap-2">
          <span className="font-semibold">
            {pendingCount} item{pendingCount > 1 ? 's' : ''} pending sync
          </span>
          <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
            Pending Sync
          </span>
        </div>
      )}
      <div className="mb-4 flex gap-2 items-center">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => {
            setAddForm({
              name: '',
              category: '',
              quantity: 0,
              unit: '',
              low_stock_alert: undefined,
              pendingSync: false,
            });
            setAddModalOpen(true);
          }}
        >
          Add New
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          disabled={selectedIds.length === 0}
          onClick={() => setBulkDeleteModalOpen(true)}
        >
          Delete Selected
        </button>
        {selectedIds.length > 0 && (
          <span className="text-sm text-gray-600">
            {selectedIds.length} selected
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
        />
        <select
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
          className="w-full max-w-xs px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
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
            Showing {paginatedData.length} of {totalRows} items
          </span>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setItemToDelete(null);
        }}
        title="Confirm Delete"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setModalOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        }
      >
        {itemToDelete ? (
          <p>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{itemToDelete.name}</span>?
          </p>
        ) : null}
      </Modal>
      {/* View Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setItemToView(null);
        }}
        title="Inventory Item Details"
        actions={
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => {
              setViewModalOpen(false);
              setItemToView(null);
            }}
          >
            Close
          </button>
        }
      >
        {itemToView ? (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Name:</span> {itemToView.name}
            </div>
            <div>
              <span className="font-semibold">Category:</span>{' '}
              {itemToView.category || '—'}
            </div>
            <div>
              <span className="font-semibold">Quantity:</span>{' '}
              {itemToView.quantity}
            </div>
            <div>
              <span className="font-semibold">Unit:</span>{' '}
              {itemToView.unit || '—'}
            </div>
            <div>
              <span className="font-semibold">Low Stock Alert:</span>{' '}
              {itemToView.low_stock_alert ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Created At:</span>{' '}
              {formatDateBritish(itemToView.created_at)}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span>{' '}
              {formatDateBritish(itemToView.updated_at)}
            </div>
            {itemToView.pendingSync && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
                Pending Sync
              </span>
            )}
          </div>
        ) : null}
      </Modal>
      {/* Edit Item Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setItemToEdit(null);
          setEditForm({ pendingSync: false });
        }}
        title="Edit Inventory Item"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setEditModalOpen(false);
                setItemToEdit(null);
                setEditForm({ pendingSync: false });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              onClick={() => {
                if (!itemToEdit) return;
                let categoryToUse = editForm.category;
                if (categoryToUse === '__other__') {
                  if (!editCategoryOther.trim()) {
                    toast.error('Please enter a new category');
                    return;
                  }
                  // Prevent duplicates (case-insensitive)
                  const exists = categoryOptions.some(
                    (c) =>
                      c.toLowerCase() === editCategoryOther.trim().toLowerCase()
                  );
                  if (exists) {
                    toast.error(
                      'This category already exists. Please select it from the list.'
                    );
                    return;
                  }
                  categoryToUse = editCategoryOther.trim();
                }
                updateInventoryItem.mutate({
                  id: itemToEdit.id,
                  ...editForm,
                  category: categoryToUse || undefined,
                });
                setEditModalOpen(false);
                setItemToEdit(null);
                setEditForm({ pendingSync: false });
                setEditCategoryOther('');
              }}
            >
              Save
            </button>
          </>
        }
      >
        {itemToEdit ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div>
              <label className="block font-semibold mb-1">Name</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editForm.name ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Category</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={editForm.category ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditForm((f) => ({ ...f, category: value }));
                  if (value === '__other__') {
                    setEditCategoryOther('');
                  } else {
                    setEditCategoryOther('');
                  }
                }}
              >
                <option value="">Select a category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="__other__">Other</option>
              </select>
              {editForm.category === '__other__' && (
                <input
                  className="w-full border rounded px-2 py-1 mt-2"
                  placeholder="Enter new category"
                  value={editCategoryOther}
                  onChange={(e) => setEditCategoryOther(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1">Quantity</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={editForm.quantity ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    quantity: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Unit</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editForm.unit ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, unit: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Low Stock Alert
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={editForm.low_stock_alert ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    low_stock_alert: Number(e.target.value),
                  }))
                }
              />
            </div>
          </form>
        ) : null}
      </Modal>
      {/* Add New Item Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddForm({
            name: '',
            category: '',
            quantity: 0,
            unit: '',
            low_stock_alert: undefined,
            pendingSync: false,
          });
        }}
        title="Add New Inventory Item"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setAddModalOpen(false);
                setAddForm({
                  name: '',
                  category: '',
                  quantity: 0,
                  unit: '',
                  low_stock_alert: undefined,
                  pendingSync: false,
                });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={() => {
                if (!addForm.name || addForm.quantity === undefined) {
                  toast.error('Name and quantity are required');
                  return;
                }
                let categoryToUse = addForm.category;
                if (categoryToUse === '__other__') {
                  if (!addCategoryOther.trim()) {
                    toast.error('Please enter a new category');
                    return;
                  }
                  // Prevent duplicates (case-insensitive)
                  const exists = categoryOptions.some(
                    (c) =>
                      c.toLowerCase() === addCategoryOther.trim().toLowerCase()
                  );
                  if (exists) {
                    toast.error(
                      'This category already exists. Please select it from the list.'
                    );
                    return;
                  }
                  categoryToUse = addCategoryOther.trim();
                }
                createInventoryItem.mutate({
                  name: addForm.name,
                  category: categoryToUse || undefined,
                  quantity: addForm.quantity,
                  unit: addForm.unit || undefined,
                  low_stock_alert:
                    typeof addForm.low_stock_alert === 'number'
                      ? addForm.low_stock_alert
                      : undefined,
                });
                setAddModalOpen(false);
                setAddForm({
                  name: '',
                  category: '',
                  quantity: 0,
                  unit: '',
                  low_stock_alert: undefined,
                  pendingSync: false,
                });
                setAddCategoryOther('');
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
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={addForm.name ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Category</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={addForm.category ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setAddForm((f) => ({ ...f, category: value }));
                if (value === '__other__') {
                  setAddCategoryOther('');
                } else {
                  setAddCategoryOther('');
                }
              }}
            >
              <option value="">Select a category</option>
              {/* Add comprehensive and unique categories */}
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="__other__">Other</option>
            </select>
            {addForm.category === '__other__' && (
              <input
                className="w-full border rounded px-2 py-1 mt-2"
                placeholder="Enter new category"
                value={addCategoryOther}
                onChange={(e) => setAddCategoryOther(e.target.value)}
              />
            )}
          </div>
          <div>
            <label className="block font-semibold mb-1">Quantity</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={addForm.quantity ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, quantity: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Unit</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={addForm.unit ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, unit: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Low Stock Alert</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={addForm.low_stock_alert ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  low_stock_alert: Number(e.target.value),
                }))
              }
            />
          </div>
        </form>
      </Modal>
      {/* Mark as Low Stock Modal */}
      <Modal
        open={lowStockModalOpen}
        onClose={() => {
          setLowStockModalOpen(false);
          setItemToMarkLowStock(null);
        }}
        title="Mark as Low Stock"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setLowStockModalOpen(false);
                setItemToMarkLowStock(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
              onClick={() => {
                toast.success(
                  `Item '${itemToMarkLowStock?.name}' marked as low stock!`
                );
                setLowStockModalOpen(false);
                setItemToMarkLowStock(null);
              }}
            >
              Confirm
            </button>
          </>
        }
      >
        {itemToMarkLowStock ? (
          <p>
            Are you sure you want to mark{' '}
            <span className="font-semibold">{itemToMarkLowStock.name}</span> as
            low stock?
          </p>
        ) : null}
      </Modal>
      {/* Feedback Modal */}
      <Modal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Success"
        actions={
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            onClick={() => setFeedbackModalOpen(false)}
          >
            OK
          </button>
        }
      >
        <div className="text-green-700 font-semibold text-center py-4">
          {feedbackMessage}
        </div>
      </Modal>
      {/* Bulk Delete Modal */}
      <Modal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Delete Selected Items"
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
                  `${selectedIds.length} item(s) deleted successfully!`
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
          item(s)?
        </div>
      </Modal>
      {/* Remove Item Modal */}
      {removeModalOpen && itemToRemove && (
        <Modal
          open={true}
          onClose={() => {
            setRemoveModalOpen(false);
            setRemoveQuantity('');
            setRemoveError('');
          }}
        >
          <h2 className="text-lg font-bold mb-2">Remove from Inventory</h2>
          <p className="mb-2">
            Item: <span className="font-semibold">{itemToRemove.name}</span>
          </p>
          <label className="block mb-1">Quantity to remove:</label>
          <input
            type="number"
            min={1}
            max={itemToRemove.quantity}
            value={removeQuantity}
            onChange={(e) => {
              setRemoveQuantity(e.target.value);
              setRemoveError('');
            }}
            className="border rounded px-2 py-1 w-full mb-2"
            placeholder={`Max: ${itemToRemove.quantity}`}
          />
          {removeError && (
            <div className="text-red-500 mb-2">{removeError}</div>
          )}
          <div className="flex gap-2 justify-end">
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => {
                setRemoveModalOpen(false);
                setRemoveQuantity('');
                setRemoveError('');
              }}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => {
                if (!itemToRemove) return;
                const qty = Number(removeQuantity);
                if (!removeQuantity || isNaN(qty) || qty < 1) {
                  setRemoveError('Please enter a valid quantity.');
                  return;
                }
                if (qty > itemToRemove.quantity) {
                  setRemoveError('Cannot remove more than available stock.');
                  return;
                }
                removeInventoryQuantity.mutate({
                  id: itemToRemove.id,
                  quantity: itemToRemove.quantity - qty,
                });
              }}
            >
              Confirm Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventoryTable;
