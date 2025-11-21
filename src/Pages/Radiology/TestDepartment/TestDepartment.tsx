import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button, TextInput, Popover } from "@mantine/core";
import NameStatusModal from "../Components/NameStatusModal";
import { notifications } from "@mantine/notifications";
import DeleteConfirm from "../../TestPackages/Components/DeleteConfirm";
import { IconDots, IconPencil } from "@tabler/icons-react";

type DepartmentRow = {
  id: string;
  name: string;
  status: string; // 'active' | 'inactive'
  order: number;
};

const DEFAULT_PAGE_SIZE = 5;

const TestDepartment: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<DepartmentRow | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Seed example data (or leave empty if you prefer)
    setDepartments((prev) =>
      prev.length === 0
        ? [
            { id: "1", name: "Radiology", status: "active", order: 1 },
            { id: "2", name: "Pathology", status: "active", order: 2 },
            { id: "3", name: "Microbiology", status: "inactive", order: 3 },
          ]
        : prev
    );
  }, []);

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "warning") => {
      const colorMap = {
        success: "blue",
        error: "red",
        warning: "yellow",
      } as const;
      notifications.show({ title: message, message, color: colorMap[type] });
    },
    []
  );

  const filtered = useMemo(() => {
    if (!searchQuery) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, searchQuery]);

  const sorted = useMemo(
    () => filtered.slice().sort((a, b) => a.order - b.order),
    [filtered]
  );

  const total = departments.length;
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  const handleAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const handleSave = async ({
    name,
    status,
  }: {
    name: string;
    status: string;
  }) => {
    setSaving(true);
    try {
      if (editing) {
        setDepartments((prev) =>
          prev.map((r) => (r.id === editing.id ? { ...r, name, status } : r))
        );
        showNotification("Department updated", "success");
      } else {
        const newOrder = departments.length
          ? Math.max(...departments.map((d) => d.order)) + 1
          : 1;
        const id = String(Date.now()) + Math.floor(Math.random() * 1000);
        const newRow: DepartmentRow = { id, name, status, order: newOrder };
        setDepartments((prev) => [...prev, newRow]);
        showNotification("Department added", "success");
      }
      setIsModalOpen(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      showNotification("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (row: DepartmentRow) => {
    setEditing(row);
    setIsModalOpen(true);
  };

  const onDelete = (row: DepartmentRow) => {
    setToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showNotification("Department deleted", "success");
    } catch (e) {
      console.error(e);
      showNotification("Failed to delete", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setToDelete(null);
    }
  };

  const renderPageButton = (pageNumber: number) => {
    const isCurrent = currentPage === pageNumber;
    const cls = isCurrent
      ? "bg-blue-600 text-white"
      : "border text-gray-600 hover:bg-gray-50";
    return (
      <button
        key={pageNumber}
        onClick={() => setCurrentPage(pageNumber)}
        className={`w-8 h-8 rounded transition-colors ${cls}`}
        aria-current={isCurrent ? "page" : undefined}
      >
        {pageNumber}
      </button>
    );
  };

  const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
  const end = start + DEFAULT_PAGE_SIZE;
  const visibleRows = sorted.slice(start, end);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Test Departments
          </h2>
          <div className="w-64">
            <TextInput
              placeholder="Search in page"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search departments"
            />
          </div>
        </div>
        <Button onClick={handleAdd} variant="filled" color="blue">
          + Add new
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Order
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-200 px-4 py-3">
                  {r.order}.
                </td>
                <td className="border-b border-gray-200 px-4 py-3">{r.name}</td>
                <td className="border-b border-gray-200 px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
                      onClick={() => onEdit(r)}
                      aria-label="Edit department"
                    >
                      <IconPencil size={16} />
                    </button>

                    <Popover position="bottom" withArrow shadow="md">
                      <Popover.Target>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="More options"
                        >
                          <IconDots className="rotate-90" />
                        </button>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <div className="flex flex-col gap-2 min-w-max">
                          <Button
                            variant="subtle"
                            color="red"
                            size="xs"
                            onClick={() => onDelete(r)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Popover.Dropdown>
                    </Popover>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {start + 1} to {Math.min(end, total)} of {total} entries
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className="inline-flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              renderPageButton
            )}
          </div>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <NameStatusModal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initialName={editing?.name}
        initialStatus={editing?.status}
        saving={saving}
        title={editing ? "Edit Department" : "Add Department"}
      />

      <DeleteConfirm
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => toDelete && confirmDelete(toDelete.id)}
        itemName={toDelete?.name}
        loading={isDeleting}
      />
    </div>
  );
};

export default TestDepartment;
