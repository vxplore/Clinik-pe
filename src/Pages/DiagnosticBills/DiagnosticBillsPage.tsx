import React, { useState } from "react";
import { Button, TextInput, Select, Checkbox } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import BillsTable from "./Components/BillsTable";

interface BillFilters {
  duration: string;
  dateRange: [Date | null, Date | null];
  regNo: string;
  patientFirstName: string;
  referredBy: string;
  collectionCentre: string;
  sampleCollectionAgent: string;
  hasDue: boolean;
  cancelled: boolean;
}

const DiagnosticBillsPage: React.FC = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<BillFilters>({
    duration: "past-7-days",
    dateRange: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    regNo: "",
    patientFirstName: "",
    referredBy: "",
    collectionCentre: "",
    sampleCollectionAgent: "",
    hasDue: false,
    cancelled: false,
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const durationOptions = [
    { value: "past-7-days", label: "Past 7 days" },
    { value: "past-30-days", label: "Past 30 days" },
    { value: "past-90-days", label: "Past 90 days" },
    { value: "custom", label: "Custom" },
  ];

  const handleFilterChange = <K extends keyof BillFilters>(
    key: K,
    value: BillFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Trigger search with current filters
    setPage(1);
    console.log("Searching with filters:", filters);
  };

  const handleClear = () => {
    setFilters({
      duration: "past-7-days",
      dateRange: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
      regNo: "",
      patientFirstName: "",
      referredBy: "",
      collectionCentre: "",
      sampleCollectionAgent: "",
      hasDue: false,
      cancelled: false,
    });
    setPage(1);
  };

  const handleAddNewCase = () => {
    navigate("/bills/add");
  };

  return (
    <div className="space-y-6 p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">All bills</h1>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
        {/*
          On small screens: 1 column
          On small/medium screens: 2 columns
          On large screens: 4 columns (max two rows with up to 4 items per row)
        */}
        <div className="grid grid-cols-6 gap-2 mb-2 items-center">
          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              Duration
              <span
                className="text-gray-400 cursor-help"
                title="Filter by date range"
              >
                ⓘ
              </span>
            </label>
            <Select
              data={durationOptions}
              value={filters.duration}
              onChange={(value) =>
                handleFilterChange("duration", value || "past-7-days")
              }
              placeholder="Select duration"
            />
          </div>

          {/* Date Range */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Date Range
            </label>
            <DatePickerInput
              type="range"
              value={filters.dateRange}
              onChange={(value) =>
                handleFilterChange(
                  "dateRange",
                  value as [Date | null, Date | null]
                )
              }
              placeholder="Select date range"
              disabled={filters.duration !== "custom"}
            />
          </div>

          {/* Reg. no. */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Reg. no.
            </label>
            <TextInput
              value={filters.regNo}
              onChange={(e) => handleFilterChange("regNo", e.target.value)}
              placeholder="Enter registration number"
            />
          </div>

          {/* Patient first name */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Patient first name
            </label>
            <TextInput
              value={filters.patientFirstName}
              onChange={(e) =>
                handleFilterChange("patientFirstName", e.target.value)
              }
              placeholder="Enter patient name"
            />
          </div>

          {/* Referred by */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">
              Referred by
            </label>
            <Select
              data={[]}
              value={filters.referredBy}
              onChange={(value) =>
                handleFilterChange("referredBy", value || "")
              }
              placeholder="Select referrer"
              searchable
            />
          </div>

          {/* Collection centre: moved to second row */}
        </div>

        {/* Second row: compact checkboxes + action buttons */}
        <div className="grid grid-cols-6 gap-2 mb-2 items-center">
          {/* Collection centre */}
          <div className="col-span-1">
            <Select
              data={[]}
              value={filters.collectionCentre}
              onChange={(value) =>
                handleFilterChange("collectionCentre", value || "")
              }
              placeholder="Collection centre"
              searchable
            />
          </div>
          {/* Sample collection agent */}
          <div className="col-span-1">
            <Select
              data={[]}
              value={filters.sampleCollectionAgent}
              onChange={(value) =>
                handleFilterChange("sampleCollectionAgent", value || "")
              }
              placeholder="Sample agent"
              searchable
            />
          </div>
          <div className="col-span-2">
            <div className="flex items-center gap-4">
              <Checkbox
                label="Has due"
                checked={filters.hasDue}
                onChange={(e) => handleFilterChange("hasDue", e.target.checked)}
              />
              <Checkbox
                label="Cancelled"
                checked={filters.cancelled}
                onChange={(e) =>
                  handleFilterChange("cancelled", e.target.checked)
                }
              />
            </div>
          </div>
          <div className="col-span-4 flex items-center justify-end gap-2">
            <Button
              leftSection={<IconSearch size={16} />}
              onClick={handleSearch}
              variant="filled"
              color="blue"
            >
              Search
            </Button>
            <Button
              leftSection={<IconX size={16} />}
              onClick={handleClear}
              variant="default"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <BillsTable
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onAddNew={handleAddNewCase}
      />
    </div>
  );
};

export default DiagnosticBillsPage;
