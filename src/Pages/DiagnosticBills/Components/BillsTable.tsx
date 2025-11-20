import React, { useState, useEffect } from "react";
import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import {
  type BookingItem,
  type BookingsListResponse,
} from "../../../APis/Types";

// We'll display transformed booking rows based on API response

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
  const [bills, setBills] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const organizationDetails = useAuthStore((s) => s.organizationDetails);
  // No expand/arrow functionality for rows; show details inline

  const total = totalRecords || bills.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Status badge helper removed; status column is not shown in table

  // handleRowClick intentionally removed

  const getGenderInitial = (gender?: string | null) => {
    if (!gender) return "";
    const g = gender.toLowerCase();
    // Show 'M' for male, otherwise omit. If needed, we can include 'F' or others later.
    if (g === "male") return "M";
    return "";
  };

  // Use organizationDetails.currency (likely 'INR' or '₹') if provided, else default to rupee sign
  const orgCurrency = organizationDetails?.currency ?? "₹";

  const formatPatient = (
    name?: string | null,
    age?: string | null,
    gender?: string | null
  ) => {
    const displayName = name ?? "—";
    const ageStr = age ? `(${age})` : "";
    const genderInitial = getGenderInitial(gender);
    return `${displayName}${ageStr}${
      genderInitial ? ` • ${genderInitial}` : ""
    }`;
  };

  const formatDiscount = (unit?: string | null, value?: string | null) => {
    if (!value) return "0";
    if (unit === "percentage") return `${value}%`;
    if (unit === "flat") {
      // if flat and zero, display just 0; otherwise show value with currency if available
      if (Number(value) === 0) return "0";
      return `${value}${orgCurrency ? ` ${orgCurrency}` : ""}`;
    }
    // fallback: show plain value with currency if available
    return `${value}${orgCurrency ? ` ${orgCurrency}` : ""}`;
  };

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const orgId = organizationDetails?.organization_id;
        const centerId = organizationDetails?.center_id;
        if (!orgId || !centerId) {
          setBills([]);
          setTotalRecords(0);
          return;
        }

        const resp = await apis.GetBillingList(orgId, centerId, page, pageSize);
        const data = resp as BookingsListResponse;
        if (data?.data?.bookings) {
          setBills(data.data.bookings);
          setTotalRecords(
            data.data.pagination?.totalRecords ?? data.data.bookings.length
          );
        } else {
          setBills([]);
          setTotalRecords(0);
        }
      } catch (err) {
        console.warn("GetBillingList failed:", err);
        setBills([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [organizationDetails, page, pageSize]);

  if (!loading && bills.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-100">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Patient
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payable
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Discount
                </th>
                {/* Status and Actions not shown in empty state */}
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Patient
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Doctor
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Phone
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Payable
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Discount
              </th>
              {/* <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Loading bills...
                </td>
              </tr>
            )}
            {bills.map((bill) => (
              <React.Fragment key={bill.booking_uid}>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatPatient(
                      bill.patient_name,
                      bill.patient_age,
                      bill.patient_gender
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {bill.created_at ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {bill.doctor_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {bill.patient_mobile ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {bill.total_amount}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {bill.payable_amount}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatDiscount(bill.discount_unit, bill.discount_value)}
                  </td>
                </tr>
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
