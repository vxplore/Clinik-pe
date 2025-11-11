import React, { useEffect, useRef, useState, useMemo } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";
import { Button, Select } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { Organization } from "../../../APis/Types";

const OrganizationTable: React.FC<{
  orgData?: Organization[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onCountryChange?: (country: string | null) => void;
  onStatusChange?: (status: string | null) => void;
  selectedCountry?: string | null;
  selectedStatus?: string | null;
}> = ({
  orgData = [],
  total,
  page: parentPage,
  pageSize: parentPageSize,
  onPageChange,
  onCountryChange,
  onStatusChange,
  selectedCountry,
  selectedStatus,
}) => {
  const navigate = useNavigate();
  console.log("OrganizationTable rendered", orgData);

  const [localPage, setLocalPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const pageSize = parentPageSize ?? 5; // server page size
  console.log("orgData:", orgData);
  const currentPage = parentPage ?? localPage;
  const records = useMemo(() => orgData ?? [], [orgData]);
  const totalRecords = total ?? records.length;
  const pageCount = Math.max(1, Math.ceil((totalRecords ?? 0) / pageSize));

  const toggleRow = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = records.map((r) => r.id);
    const allSelected =
      ids.length > 0 && ids.every((id) => selected.includes(id));
    if (allSelected) {
      // remove these ids
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      // add visible ids
      setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleAdd = () => {
    navigate("/organization/add");
  };
  useEffect(() => {
    const ids = records.map((r) => r.id);
    const someSelected = ids.some((id) => selected.includes(id));
    const allSelected =
      ids.length > 0 && ids.every((id) => selected.includes(id));
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [records, selected]);

  // No data fetching here — parent component must provide paginated data and control page changes.

  const columns: DataTableColumn<Organization>[] = [
    {
      accessor: "select",
      width: 40,
      title: (
        <input
          ref={headerCheckboxRef}
          type="checkbox"
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
          checked={
            records.length > 0 && records.every((r) => selected.includes(r.id))
          }
          onChange={toggleSelectAll}
          aria-label="select all visible"
        />
      ),
      render: (r) => (
        <input
          type="checkbox"
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
          checked={selected.includes(r.id)}
          onChange={() => toggleRow(r.id)}
        />
      ),
    },
    {
      accessor: "name",
      title: "Organization Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center bg-gray-100 text-gray-700`}
          >
            {r.name ? r.name.charAt(0).toUpperCase() : "O"}
          </div>
          <div className="text-gray-800">{r.name}</div>
        </div>
      ),
    },
    { accessor: "country", title: "Country" },
    { accessor: "time_zone", title: "Timezone", render: (r) => r.time_zone },
    {
      accessor: "center_count",
      title: "Centers",
      render: (r) => {
        // center_count may not be declared on Organization type, so guard access safely
        const maybe: unknown = r;
        return (maybe as { center_count?: number }).center_count ?? 0;
      },
    },
    {
      accessor: "status",
      title: "Status",
      render: (r) =>
        (r.status ?? "").toLowerCase() === "active" ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
            Inactive
          </span>
        ),
    },
    {
      accessor: "action",
      title: "Action",
      width: 100,
      render: () => (
        <button className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0 focus-visible:outline-none">
          <IconDots className="rotate-90" />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 ring-1 ring-gray-100">
      {/* Filters & Actions */}
      <div className="flex  items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Organizations</h2>

        <div className="flex items-center gap-3">
          <Select
            placeholder="All Countries"
            data={["All Countries", "India", "United States"]}
            value={
              selectedCountry === null || selectedCountry === "All Countries"
                ? null
                : selectedCountry
            }
            onChange={(val) => {
              onCountryChange?.(val === "All Countries" ? null : val);
            }}
            clearable
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
          />

          <Select
            placeholder="All Status"
            data={["All Status", "Active", "Inactive"]}
            value={
              selectedStatus === null || selectedStatus === "All Status"
                ? null
                : selectedStatus
            }
            onChange={(val) => {
              onStatusChange?.(val === "All Status" ? null : val);
            }}
            clearable
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
          />

          <Button
            onClick={handleAdd}
            variant="filled"
            color="blue"
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md"
          >
            + Add Organization
          </Button>
        </div>
      </div>
      <div className="-mx-4 h-px bg-gray-200 mb-3"></div>

      {/* Mantine DataTable */}
      <DataTable
        records={records}
        columns={columns}
        highlightOnHover
        className="text-sm"
        striped={false}
        idAccessor="id"
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {records.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {(currentPage - 1) * pageSize + records.length} of {totalRecords}{" "}
          entries
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={currentPage === 1}
            onClick={() => {
              const prev = Math.max(1, currentPage - 1);
              if (onPageChange) onPageChange(prev);
              else setLocalPage(prev);
            }}
          >
            Previous
          </button>

          <div className="inline-flex items-center gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => {
                  if (onPageChange) onPageChange(n);
                  else setLocalPage(n);
                }}
                className={`w-8 h-8 rounded ${
                  currentPage === n
                    ? "bg-blue-600 text-white"
                    : "border text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={currentPage === pageCount}
            onClick={() => {
              const next = Math.min(currentPage + 1, pageCount);
              if (onPageChange) onPageChange(next);
              else setLocalPage(next);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationTable;
