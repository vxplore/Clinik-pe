import React, { useState } from "react";
import { Button, Badge } from "@mantine/core";
import { IconPlus, IconChevronRight } from "@tabler/icons-react";

interface Bill {
  id: string;
  regNo: string;
  date: string;
  patient: string;
  referredBy: string;
  total: string;
  paid: string;
  discount: string;
  status: "paid" | "pending" | "cancelled";
}

interface BillsTableProps {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onAddNew: () => void;
}

const BillsTable: React.FC<BillsTableProps> = ({
  page,
  pageSize,
  onPageChange,
  onAddNew,
}) => {
  // Mock data - replace with actual API call
  const [bills] = useState<Bill[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const total = bills.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getStatusBadge = (status: Bill["status"]) => {
    const statusConfig = {
      paid: { color: "green", label: "Paid" },
      pending: { color: "yellow", label: "Pending" },
      cancelled: { color: "red", label: "Cancelled" },
    };

    const config = statusConfig[status];
    return (
      <Badge color={config.color} variant="light" size="sm">
        {config.label}
      </Badge>
    );
  };

  const handleRowClick = (billId: string) => {
    setExpandedRow(expandedRow === billId ? null : billId);
  };

  if (bills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-100">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <IconChevronRight size={16} className="opacity-0" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reg. No.
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Patient
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Referred by
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Paid
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Discount
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No cases to show.
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Get started by adding a new case.
          </p>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onAddNew}
            variant="filled"
            color="blue"
          >
            Add new case
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-100">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                <IconChevronRight size={16} className="opacity-0" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Reg. No.
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Patient
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Referred by
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Paid
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Discount
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <React.Fragment key={bill.id}>
                <tr
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(bill.id)}
                >
                  <td className="px-4 py-3">
                    <IconChevronRight
                      size={16}
                      className={`transition-transform ${
                        expandedRow === bill.id ? "rotate-90" : ""
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {bill.regNo}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{bill.date}</td>
                  <td className="px-4 py-3 text-gray-900">{bill.patient}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {bill.referredBy || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{bill.total}</td>
                  <td className="px-4 py-3 text-gray-900">{bill.paid}</td>
                  <td className="px-4 py-3 text-gray-900">{bill.discount}</td>
                  <td className="px-4 py-3">{getStatusBadge(bill.status)}</td>
                  <td className="px-4 py-3">
                    <Button size="xs" variant="subtle">
                      View
                    </Button>
                  </td>
                </tr>
                {expandedRow === bill.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={10} className="px-4 py-4">
                      <div className="text-sm text-gray-600">
                        {/* Expanded content goes here */}
                        <p>Additional bill details for {bill.regNo}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="default"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded text-sm transition-colors ${
                  page === p
                    ? "bg-blue-600 text-white"
                    : "border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            size="xs"
            variant="default"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillsTable;
