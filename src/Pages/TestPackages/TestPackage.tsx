import React, { useState, useEffect } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDots, IconPencil } from "@tabler/icons-react";

import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";

import type {
  TestPackageRow,
  TestPackageUpdatePayload,
} from "../../APis/Types";

import EditPackageDrawer from "./Components/EditPackageDrawer";
import DeleteConfirm from "./Components/DeleteConfirm";

const TestPackage: React.FC = () => {
  const { organizationDetails } = useAuthStore();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [query, setQuery] = useState("");

  const [packages, setPackages] = useState<TestPackageRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editingRow, setEditingRow] = useState<TestPackageRow | null>(null);
  const [editingOpen, setEditingOpen] = useState(false);

  const [deletingRow, setDeletingRow] = useState<TestPackageRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // ---------------------------------------
  // Server-side pagination + Filtering
  // ---------------------------------------
  // rows = packages (server returns the requested page)
  const rows = packages;
  const total = totalRecords;

  // ---------------------------------------
  // Save (create/update)
  // ---------------------------------------
  const handleSavePackage = async (
    row: TestPackageRow,
    removeTests?: string[],
    removePanels?: string[]
  ) => {
    setSaving(true);

    try {
      const price = Number(row.price || row.fee || 0);
      const tests =
        row.tests?.map((t) => (typeof t === "string" ? { test_id: t } : t)) ||
        [];
      const panels =
        row.panels?.map((p) => (typeof p === "string" ? { panel_id: p } : p)) ||
        [];

      const payload = {
        name: row.name,
        price,
        bill_only_for_gender: (
          row.bill_only_for_gender ||
          row.gender ||
          "both"
        ).toLowerCase() as "male" | "female" | "both",

        tests,
        panels,
      };

      const id = row.uid || row.id;

      if (packages.some((p) => (p.uid || p.id) === id)) {
        // update
        const orgId = organizationDetails?.organization_id;
        const centerId = organizationDetails?.center_id;

        if (!orgId || !centerId) throw new Error("Organization not found");

        const updatePayload: TestPackageUpdatePayload = {
          name: payload.name,
          price: payload.price,
          bill_only_for_gender: payload.bill_only_for_gender,
          tests: tests,
          panels: panels,
          remove_tests: removeTests || [],
          remove_panels: removePanels || [],
        };
        await apis.UpdateTestPackage(orgId, centerId, id!, updatePayload);
        // After update, refetch packages to get fresh data from server
        await fetchPackages();

        notifications.show({
          title: "Updated",
          message: "Package updated successfully.",
          color: "green",
        });
      } else {
        // create
        const orgId = organizationDetails?.organization_id;
        const centerId = organizationDetails?.center_id;

        if (!orgId || !centerId) throw new Error("Organization not found");

        await apis.AddTestPackage(orgId, centerId, payload);

        // After creation, re-fetch packages to avoid adding any mock/local-only row
        await fetchPackages();

        notifications.show({
          title: "Saved",
          message: "Package added successfully.",
          color: "green",
        });
      }
    } catch (err) {
      console.error(err);

      notifications.show({
        title: "Error",
        message: "Failed to save package. Changes not applied.",
        color: "red",
      });

      // fallback local update - do not add new mock rows; update only if package exists locally
      const id = row.uid || row.id;
      setPackages((prev) => {
        const exists = prev.some((p) => (p.uid || p.id) === id);
        return exists
          ? prev.map((p) => ((p.uid || p.id) === id ? row : p))
          : prev;
      });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // Delete
  // ---------------------------------------
  const handleDeleteConfirm = async (id: string) => {
    setDeleting(true);

    try {
      await apis.DeleteTestPackage(id);
      // re-fetch from server after delete to get up-to-date list
      await fetchPackages();

      notifications.show({
        title: "Deleted",
        message: "Package removed successfully.",
        color: "red",
      });
    } catch (err) {
      console.error(err);

      // Do not remove locally if delete fails to avoid local-only changes
      notifications.show({
        title: "Error",
        message: "Failed to delete package. Please try again.",
        color: "red",
      });
    } finally {
      setDeletingRow(null);
      setDeleting(false);
    }
  };

  // ---------------------------------------
  // Fetch packages helper
  // ---------------------------------------
  const fetchPackages = React.useCallback(async () => {
    setLoading(true);
    try {
      const orgId = organizationDetails?.organization_id;
      const centerId = organizationDetails?.center_id;
      if (!orgId || !centerId) {
        notifications.show({
          title: "Error",
          message: "Organization or center not found",
          color: "red",
        });
        return;
      }
      const resp = await apis.GetTestPackages(
        query,
        page,
        pageSize,
        orgId,
        centerId
      );
      if (resp?.data?.packages) {
        setPackages(resp.data.packages);
        const totalFromResp =
          resp.data.pagination?.totalRecords ?? resp.data.packages?.length ?? 0;
        setTotalRecords(totalFromResp);
      }
    } catch (err) {
      console.warn("GetTestPackages failed:", err);
      notifications.show({
        title: "Error",
        message: "Failed to load test packages.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [organizationDetails, page, pageSize, query]);

  // Load packages on mount and when organization changes
  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    fetchPackages();
    return () => {
      mounted = false;
    };
  }, [fetchPackages, page, pageSize, query]);

  // Adjust page if totalRecords has changed and current page is out of range
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [totalRecords, page, pageSize]);

  // ---------------------------------------
  // Table Columns
  // ---------------------------------------
  const columns: DataTableColumn<TestPackageRow>[] = [
    {
      accessor: "sno",
      title: "S.NO.",
      width: 80,
      render: (_row, index) => (
        <div>{(page - 1) * pageSize + (index + 1)}.</div>
      ),
    },
    {
      accessor: "name",
      title: "Name",
      render: (r) => <div className="font-medium text-gray-900">{r.name}</div>,
    },
    {
      accessor: "fee",
      title: "Price",
      width: 90,
      render: (r) => <div>{r.price || r.fee}</div>,
    },
    {
      accessor: "gender",
      title: "Gender",
      width: 80,
      render: (r) => (
        <div className="text-sm text-gray-600">
          {r.bill_only_for_gender || r.gender}
        </div>
      ),
    },
    {
      accessor: "included",
      title: "Tests",
      render: (r) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {Array.isArray(r.tests)
            ? r.tests
                .map((t) =>
                  typeof t === "string" ? t : t.test_name || t.test_id
                )
                .join(", ")
            : r.included || ""}
        </div>
      ),
    },
    {
      accessor: "panels",
      title: "Panels",
      render: (r) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {Array.isArray(r.panels)
            ? r.panels
                .map((p) =>
                  typeof p === "string" ? p : p.panel_name || p.panel_id
                )
                .join(", ")
            : ""}
        </div>
      ),
    },
    {
      accessor: "action",
      title: "ACTION",
      width: 100,
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            className="text-blue-600"
            onClick={() => {
              setEditingRow(r);
              setEditingOpen(true);
            }}
          >
            <IconPencil size={16} />
          </button>

          <Popover position="bottom" withArrow shadow="md">
            <Popover.Target>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <IconDots className="rotate-90" />
              </button>
            </Popover.Target>

            <Popover.Dropdown>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => {
                  setDeletingRow(r);
                  setDeleteModalOpen(true);
                }}
              >
                Remove
              </Button>
            </Popover.Dropdown>
          </Popover>
        </div>
      ),
    },
  ];

  // ---------------------------------------
  // Render
  // ---------------------------------------
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Test Packages</h2>

        <div className="flex items-center gap-3">
          <TextInput
            placeholder="Search in page"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />

          <Button
            variant="filled"
            color="blue"
            onClick={() => {
              setEditingRow(null);
              setEditingOpen(true);
            }}
            disabled={loading}
          >
            + Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        records={rows}
        columns={columns}
        highlightOnHover
        className="text-sm"
        idAccessor="id"
      />

      {/* Edit Drawer */}
      <EditPackageDrawer
        opened={editingOpen}
        onClose={() => {
          setEditingOpen(false);
          setEditingRow(null);
        }}
        row={editingRow}
        onSave={handleSavePackage}
        loading={saving}
      />

      {/* Delete Modal */}
      <DeleteConfirm
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() =>
          deletingRow &&
          handleDeleteConfirm(deletingRow.uid || deletingRow.id || "")
        }
        itemName={deletingRow?.name}
        loading={deleting}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {total === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from(
              { length: Math.ceil(total / pageSize) || 1 },
              (_, i) => i + 1
            ).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded ${
                  page === n ? "bg-blue-600 text-white" : "border text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPackage;
