import React, { useEffect, useRef, useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { IconDots } from "@tabler/icons-react";
import { Button, Select, Popover } from "@mantine/core";

type AvailabilityItem = {
  id: number;
  day: string;
  start: string;
  end: string;
  interval: string;
  type: string;
  status: "Active" | "Inactive";
};

type Props = {
  items?: AvailabilityItem[];
  selectedStatus?: string | undefined;
  onStatusChange?: (status: string | undefined) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  total?: number;
};

const AvailabilityTable: React.FC<Props> = ({
  items = [
    {
      id: 1,
      day: "Monday",
      start: "08:00 AM",
      end: "06:00 PM",
      interval: "10 mins",
      type: "In-clinic",
      status: "Active",
    },
    {
      id: 2,
      day: "Saturday - Sunday",
      start: "09:00 AM",
      end: "04:00 PM",
      interval: "15 mins",
      type: "Online",
      status: "Active",
    },
    {
      id: 3,
      day: "Tue-Wed",
      start: "09:00 AM",
      end: "04:00 PM",
      interval: "15 mins",
      type: "Online",
      status: "Inactive",
    },
  ],
  selectedStatus,
  onStatusChange,
  page = 1,
  onPageChange,
  pageSize = 5,
  total = 0,
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const [popoverOpenId, setPopoverOpenId] = useState<string | null>(null);

  const toggleRow = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const ids = items.map((r) => r.id);
    const allSelected = ids.every((id) => selected.includes(id));
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  useEffect(() => {
    const ids = items.map((r) => r.id);
    const someSelected = ids.some((id) => selected.includes(id));
    const allSelected =
      ids.length > 0 && ids.every((id) => selected.includes(id));
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [items, selected]);

  const columns: DataTableColumn<AvailabilityItem>[] = [
    {
      accessor: "select",
      width: 40,
      title: (
        <input
          ref={headerCheckboxRef}
          type="checkbox"
          className="focus:outline-none focus:ring-0 focus-visible:outline-none"
          checked={
            items.length > 0 && items.every((r) => selected.includes(r.id))
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
      accessor: "day",
      title: "Day",
      render: (r) => <div className="text-gray-800 font-medium">{r.day}</div>,
    },
    {
      accessor: "start",
      title: "Start Time",
      render: (r) => <div className="text-gray-600">{r.start}</div>,
    },
    {
      accessor: "end",
      title: "End Time",
      render: (r) => <div className="text-gray-600">{r.end}</div>,
    },
    {
      accessor: "interval",
      title: "Time Slot Interval",
      render: (r) => <div className="text-gray-600">{r.interval}</div>,
    },
    {
      accessor: "type",
      title: "Appointment Type",
      render: (r) => <div className="text-gray-600">{r.type}</div>,
    },
    {
      accessor: "status",
      title: "Status",
      render: (r) =>
        r.status === "Active" ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            Inactive
          </span>
        ),
    },
    {
      accessor: "action",
      title: "Action",
      width: 100,
      render: (r) => (
        <Popover
          position="bottom"
          withArrow
          shadow="md"
          opened={popoverOpenId === String(r.id)}
          onClose={() => setPopoverOpenId(null)}
        >
          <Popover.Target>
            <button
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setPopoverOpenId(
                  popoverOpenId === String(r.id) ? null : String(r.id)
                );
              }}
            >
              <IconDots className="rotate-90" />
            </button>
          </Popover.Target>
          <Popover.Dropdown>
            <div className="flex flex-col gap-2 min-w-max">
              <Button variant="subtle" size="xs">
                Edit
              </Button>
              <Button variant="subtle" size="xs" color="red">
                Delete
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      ),
    },
  ];

  const pageCount = total > 0 ? Math.ceil(total / pageSize) : 1;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-gray-800">
          List of Availability
        </h3>
        <div>
          <Select
            placeholder="All Status"
            data={["All Status", "Active", "Inactive"]}
            classNames={{
              input:
                "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
            }}
            value={selectedStatus ?? "All Status"}
            onChange={(v) => {
              const val: string | undefined = v ?? undefined;
              onStatusChange?.(val === "All Status" ? undefined : val);
            }}
          />
        </div>
      </div>
      <div className="-mx-4 h-px bg-gray-200 mb-3"></div>

      <DataTable
        records={items}
        columns={columns}
        highlightOnHover
        className="text-sm"
        striped={false}
        idAccessor="id"
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total || items.length)} of{" "}
          {total || items.length} entries
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={page === 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            Previous
          </button>

          <div className="inline-flex items-center gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => onPageChange?.(n)}
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
            disabled={page >= pageCount}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityTable;
