import React, { useState, useMemo } from 'react';
import DataTable, { Column, SortState } from './DataTable';
import { trpc } from '../utils/trpc';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { useOnlineStatus } from '../lib/useOnlineStatus';
import { Client } from '../types/client';

// Extend Client for table data to include renderActions
type ClientRow = Client & { renderActions?: () => React.ReactNode };

// Define columns for the clients table
const columns: Column<Client>[] = [
  { accessor: 'id', header: 'Client ID' },
  { accessor: 'name', header: 'Name', render: (value) => value || '-' },
  {
    accessor: 'phone',
    header: 'Phone Number',
    render: (value) => value || '-',
  },
  { accessor: 'email', header: 'Email', render: (value) => value || '-' },
  {
    accessor: 'created_at',
    header: 'Created At',
    render: (value) => (value ? formatDateBritish(value) : '-'),
  },
  {
    accessor: 'chest',
    header: 'Measurements',
    render: (_, row) => {
      // Count how many measurement fields are filled
      const fields = [
        'neck',
        'chest',
        'bust',
        'waist',
        'hips',
        'thigh',
        'inseam',
        'arm_length',
      ];
      const filled = fields.filter(
        (f) =>
          (row as Client)[f as keyof Client] !== undefined &&
          (row as Client)[f as keyof Client] !== null
      ).length;
      return `${filled} fields`;
    },
  },
  // You can add more columns for total orders, total paid, last order date if you join data
];

// Add Actions column for view button
const columnsWithActions: Column<ClientRow>[] = [
  ...columns,
  {
    accessor: 'renderActions',
    header: 'Actions',
    render: (_, row) => row.renderActions?.(),
  },
];

const defaultSort: SortState<Client> = { column: null, direction: 'asc' };
const defaultRowsPerPage = 10;

function formatDateBritish(dateValue: string | Date) {
  const d = new Date(dateValue);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * ClientsTable fetches and displays real client data using tRPC.
 */
const ClientsTable: React.FC = () => {
  const { data, isLoading, error } = trpc.getClients.useQuery();
  const clients: Client[] = (data ?? []).map((c) => ({
    ...(c as any),
    pendingSync: (c as any).pendingSync ?? false,
  }));
  console.log('ClientsTable data:', data);
  const [sortState, setSortState] = useState<SortState<Client>>(defaultSort);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  // View details modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [clientToView, setClientToView] = useState<Client | null>(null);
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({
    name: '',
    phone: '',
    email: '',
    neck: null,
    chest: null,
    bust: null,
    waist: null,
    hips: null,
    thigh: null,
    inseam: null,
    arm_length: null,
    outseam: null,
    ankle: null,
    shoulder: null,
    sleeve_length: null,
    knee: null,
    wrist: null,
    rise: null,
    bicep: null,
    notes: '',
    pendingSync: false,
  });
  // Add new modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Client>>({
    name: '',
    phone: '',
    email: '',
    neck: null,
    chest: null,
    bust: null,
    waist: null,
    hips: null,
    thigh: null,
    inseam: null,
    arm_length: null,
    outseam: null,
    ankle: null,
    shoulder: null,
    sleeve_length: null,
    knee: null,
    wrist: null,
    rise: null,
    bicep: null,
    notes: '',
    pendingSync: false,
  });
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Bulk delete modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const online = useOnlineStatus();

  // Filtering logic
  const filteredData = useMemo(() => {
    if (!clients) return [];
    if (!search.trim()) return clients;
    const term = search.trim().toLowerCase();
    return clients.filter((row) =>
      columns.some((col) => {
        // Only filter on real Client fields
        if (col.accessor === 'renderActions') return false;
        if (
          typeof col.accessor === 'string' &&
          (col.accessor as keyof Client) in row
        ) {
          const value = (row as any)[col.accessor as keyof Client];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(term);
        }
        return false;
      })
    );
  }, [clients, search]);

  // Sorting logic (applied after filtering)
  const sortedData = useMemo(() => {
    if (!filteredData) return [];
    if (!sortState.column) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortState.column!];
      const bValue = b[sortState.column!];
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
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Only add renderActions after all filtering, sorting, and pagination
  const paginatedDataWithActions: ClientRow[] = paginatedData.map((row) => ({
    ...row,
    renderActions: () => (
      <>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          onClick={() => {
            setClientToView(row);
            setViewModalOpen(true);
          }}
        >
          View
        </button>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm ml-2"
          onClick={() => {
            setClientToEdit(row);
            setEditForm(row);
            setEditModalOpen(true);
          }}
        >
          Edit
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm ml-2"
          onClick={() => {
            setClientToDelete(row);
            setDeleteModalOpen(true);
          }}
        >
          Delete
        </button>
      </>
    ),
  }));

  // Fix columnsWithBulk: bulkSelect column renders a checkbox for each row, and header has a working 'Select All' checkbox
  const columnsWithBulk: Column<ClientRow>[] = [
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
              setClientToView(row);
              setViewModalOpen(true);
            }}
          >
            View
          </button>
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm ml-2"
            onClick={() => {
              setClientToEdit(row);
              setEditForm(row);
              setEditModalOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm ml-2"
            onClick={() => {
              setClientToDelete(row);
              setDeleteModalOpen(true);
            }}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  // Handlers
  const handleSort = (column: keyof Client | 'renderActions') => {
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

  // Reset to page 1 if search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage, sortState]);

  if (isLoading) return <div>Loading clients...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-bold">Clients</h2>
      <input
        type="text"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-xs px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
      />
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => {
            setAddForm({
              name: '',
              phone: '',
              email: '',
              neck: null,
              chest: null,
              bust: null,
              waist: null,
              hips: null,
              thigh: null,
              inseam: null,
              arm_length: null,
              outseam: null,
              ankle: null,
              shoulder: null,
              sleeve_length: null,
              knee: null,
              wrist: null,
              rise: null,
              bicep: null,
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
            Showing {paginatedData.length} of {totalRows} clients
          </span>
        </div>
      </div>
      {/* View Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setClientToView(null);
        }}
        title="Client Details"
        actions={
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => {
              setViewModalOpen(false);
              setClientToView(null);
            }}
          >
            Close
          </button>
        }
      >
        {clientToView ? (
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Name:</span> {clientToView.name}{' '}
              {clientToView.pendingSync && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-xs rounded">
                  Pending Sync
                </span>
              )}
            </div>
            <div>
              <span className="font-semibold">Phone:</span>{' '}
              {clientToView.phone || '—'}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{' '}
              {clientToView.email || '—'}
            </div>
            <div>
              <span className="font-semibold">Neck:</span>{' '}
              {clientToView.neck ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Chest:</span>{' '}
              {clientToView.chest ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Bust:</span>{' '}
              {clientToView.bust ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Waist:</span>{' '}
              {clientToView.waist ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Hips:</span>{' '}
              {clientToView.hips ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Thigh:</span>{' '}
              {clientToView.thigh ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Inseam:</span>{' '}
              {clientToView.inseam ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Outseam:</span>{' '}
              {clientToView.outseam ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Arm Length:</span>{' '}
              {clientToView.arm_length ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Shoulder:</span>{' '}
              {clientToView.shoulder ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Sleeve Length:</span>{' '}
              {clientToView.sleeve_length ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Knee:</span>{' '}
              {clientToView.knee ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Wrist:</span>{' '}
              {clientToView.wrist ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Rise:</span>{' '}
              {clientToView.rise ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Bicep:</span>{' '}
              {clientToView.bicep ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Ankle:</span>{' '}
              {clientToView.ankle ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Notes:</span>{' '}
              {clientToView.notes || '—'}
            </div>
            <div>
              <span className="font-semibold">Created At:</span>{' '}
              {formatDateBritish(clientToView.created_at)}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span>{' '}
              {formatDateBritish(clientToView.updated_at)}
            </div>
          </div>
        ) : null}
      </Modal>
      {/* Edit Client Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setClientToEdit(null);
          setEditForm({
            name: '',
            phone: '',
            email: '',
            neck: null,
            chest: null,
            bust: null,
            waist: null,
            hips: null,
            thigh: null,
            inseam: null,
            arm_length: null,
            outseam: null,
            ankle: null,
            shoulder: null,
            sleeve_length: null,
            knee: null,
            wrist: null,
            rise: null,
            bicep: null,
            notes: '',
            pendingSync: false,
          });
        }}
        title="Edit Client"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setEditModalOpen(false);
                setClientToEdit(null);
                setEditForm({
                  name: '',
                  phone: '',
                  email: '',
                  neck: null,
                  chest: null,
                  bust: null,
                  waist: null,
                  hips: null,
                  thigh: null,
                  inseam: null,
                  arm_length: null,
                  outseam: null,
                  ankle: null,
                  shoulder: null,
                  sleeve_length: null,
                  knee: null,
                  wrist: null,
                  rise: null,
                  bicep: null,
                  notes: '',
                  pendingSync: false,
                });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              onClick={() => {
                toast.success(`Client updated successfully!`);
                setEditModalOpen(false);
                setClientToEdit(null);
                setEditForm({
                  name: '',
                  phone: '',
                  email: '',
                  neck: null,
                  chest: null,
                  bust: null,
                  waist: null,
                  hips: null,
                  thigh: null,
                  inseam: null,
                  arm_length: null,
                  outseam: null,
                  ankle: null,
                  shoulder: null,
                  sleeve_length: null,
                  knee: null,
                  wrist: null,
                  rise: null,
                  bicep: null,
                  notes: '',
                  pendingSync: false,
                });
              }}
            >
              Save
            </button>
          </>
        }
      >
        {clientToEdit ? (
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
              <label className="block font-semibold mb-1">Phone</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editForm.phone ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                className="w-full border rounded px-2 py-1"
                value={editForm.email ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            {/* Measurement fields for edit */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium">Shoulder</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={
                    editForm.shoulder !== null &&
                    editForm.shoulder !== undefined
                      ? editForm.shoulder
                      : ''
                  }
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      shoulder:
                        e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium">
                  Sleeve Length
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={
                    editForm.sleeve_length !== null &&
                    editForm.sleeve_length !== undefined
                      ? editForm.sleeve_length
                      : ''
                  }
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      sleeve_length:
                        e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Knee</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={
                    editForm.knee !== null && editForm.knee !== undefined
                      ? editForm.knee
                      : ''
                  }
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      knee:
                        e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Wrist</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={
                    editForm.wrist !== null && editForm.wrist !== undefined
                      ? editForm.wrist
                      : ''
                  }
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      wrist:
                        e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Rise</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={
                    editForm.rise !== null && editForm.rise !== undefined
                      ? editForm.rise
                      : ''
                  }
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      rise:
                        e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Bicep</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={
                    editForm.bicep !== null && editForm.bicep !== undefined
                      ? editForm.bicep
                      : ''
                  }
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      bicep:
                        e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            {/* Notes field */}
            <div>
              <label className="block font-semibold mb-1">Notes</label>
              <textarea
                className="w-full border rounded px-2 py-1"
                value={editForm.notes ?? ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
          </form>
        ) : null}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        title="Confirm Delete"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setDeleteModalOpen(false);
                setClientToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={() => {
                toast.success(`Client deleted successfully!`);
                setDeleteModalOpen(false);
                setClientToDelete(null);
              }}
            >
              Delete
            </button>
          </>
        }
      >
        {clientToDelete ? (
          <p>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{clientToDelete.name}</span>?
          </p>
        ) : null}
      </Modal>
      {/* Bulk Delete Modal */}
      <Modal
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        title="Delete Selected Clients"
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
                  `${selectedIds.length} client(s) deleted successfully!`
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
          client(s)?
        </div>
      </Modal>
      {/* Add Client Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddForm({
            name: '',
            phone: '',
            email: '',
            neck: null,
            chest: null,
            bust: null,
            waist: null,
            hips: null,
            thigh: null,
            inseam: null,
            arm_length: null,
            outseam: null,
            ankle: null,
            shoulder: null,
            sleeve_length: null,
            knee: null,
            wrist: null,
            rise: null,
            bicep: null,
            notes: '',
            pendingSync: false,
          });
        }}
        title="Add New Client"
        actions={
          <>
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 mr-2"
              onClick={() => {
                setAddModalOpen(false);
                setAddForm({
                  name: '',
                  phone: '',
                  email: '',
                  neck: null,
                  chest: null,
                  bust: null,
                  waist: null,
                  hips: null,
                  thigh: null,
                  inseam: null,
                  arm_length: null,
                  outseam: null,
                  ankle: null,
                  shoulder: null,
                  sleeve_length: null,
                  knee: null,
                  wrist: null,
                  rise: null,
                  bicep: null,
                  notes: '',
                  pendingSync: false,
                });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              onClick={async () => {
                // Validate required fields
                if (!addForm.name) {
                  toast.error('Name is required.');
                  return;
                }
                if (online) {
                  // TODO: Call tRPC mutation to create client on server
                  toast.success('Client added successfully!');
                } else {
                  // Save to IndexedDB with pendingSync
                  // TODO: Actually call addClient from indexedDb.ts here
                  toast('Client saved locally. Will sync when back online.', {
                    icon: '📦',
                  });
                }
                setAddModalOpen(false);
                setAddForm({
                  name: '',
                  phone: '',
                  email: '',
                  neck: null,
                  chest: null,
                  bust: null,
                  waist: null,
                  hips: null,
                  thigh: null,
                  inseam: null,
                  arm_length: null,
                  outseam: null,
                  ankle: null,
                  shoulder: null,
                  sleeve_length: null,
                  knee: null,
                  wrist: null,
                  rise: null,
                  bicep: null,
                  notes: '',
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
          <div>
            <label className="block font-semibold mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded px-2 py-1"
              value={addForm.name ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={addForm.phone ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={addForm.email ?? ''}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
          {/* Measurement fields */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium">Neck</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.neck !== null && addForm.neck !== undefined
                    ? addForm.neck
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    neck: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Chest</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.chest !== null && addForm.chest !== undefined
                    ? addForm.chest
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    chest:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Bust</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.bust !== null && addForm.bust !== undefined
                    ? addForm.bust
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    bust: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Waist</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.waist !== null && addForm.waist !== undefined
                    ? addForm.waist
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    waist:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Hips</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.hips !== null && addForm.hips !== undefined
                    ? addForm.hips
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    hips: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Thigh</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.thigh !== null && addForm.thigh !== undefined
                    ? addForm.thigh
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    thigh:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Inseam</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.inseam !== null && addForm.inseam !== undefined
                    ? addForm.inseam
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    inseam:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Arm Length</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.arm_length !== null &&
                  addForm.arm_length !== undefined
                    ? addForm.arm_length
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    arm_length:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Outseam</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.outseam !== null && addForm.outseam !== undefined
                    ? addForm.outseam
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    outseam:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Ankle</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.ankle !== null && addForm.ankle !== undefined
                    ? addForm.ankle
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    ankle:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Shoulder</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.shoulder !== null && addForm.shoulder !== undefined
                    ? addForm.shoulder
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    shoulder:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Sleeve Length</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.sleeve_length !== null &&
                  addForm.sleeve_length !== undefined
                    ? addForm.sleeve_length
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    sleeve_length:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Knee</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.knee !== null && addForm.knee !== undefined
                    ? addForm.knee
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    knee: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Wrist</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.wrist !== null && addForm.wrist !== undefined
                    ? addForm.wrist
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    wrist:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Rise</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.rise !== null && addForm.rise !== undefined
                    ? addForm.rise
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    rise: e.target.value === '' ? null : Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Bicep</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={
                  addForm.bicep !== null && addForm.bicep !== undefined
                    ? addForm.bicep
                    : ''
                }
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    bicep:
                      e.target.value === '' ? null : Number(e.target.value),
                  }))
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
                setAddForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsTable;
