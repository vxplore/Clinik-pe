import { useState, type ChangeEvent } from "react";
import {
  Drawer,
  Select,
  Badge,
  TextInput,
  Group,
  Avatar,
  Button,
} from "@mantine/core";
import { IconSearch, IconEye } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";

// Appointment record type
interface Appointment {
  id: number;
  time: string;
  name: string;
  details: string;
  type: string;
  amount: number;
  status: string;
}

export default function Appointments() {
  const [opened, setOpened] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [page, setPage] = useState(1);
  const [recordsData, setRecordsData] = useState<Appointment[]>([]);
  const PAGE_SIZE = 10;

  // --- Mock data ---
  const records: Appointment[] = [
    {
      id: 1,
      time: "11:30 AM",
      name: "Ananya Sharma",
      details: "F, 28, Mumbai",
      type: "In-Clinic",
      amount: 800,
      status: "Upcoming",
    },
    {
      id: 2,
      time: "12:00 PM",
      name: "Rohan Verma",
      details: "M, 42, Delhi",
      type: "Online",
      amount: 500,
      status: "Upcoming",
    },
    {
      id: 3,
      time: "01:15 PM",
      name: "Priya Singh",
      details: "F, 35, Bangalore",
      type: "Completed",
      amount: 600,
      status: "Checked In",
    },
    {
      id: 4,
      time: "01:15 PM",
      name: "Priya Singh",
      details: "F, 35, Bangalore",
      type: "Completed",
      amount: 750,
      status: "Checked In",
    },
  ];

  // Initialize filtered data
  useState(() => setRecordsData(records));

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setRecordsData(
      records.filter(
        (r) =>
          r.name.toLowerCase().includes(value) ||
          r.details.toLowerCase().includes(value)
      )
    );
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpened(true);
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center justify-between">
        <TextInput
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          className="w-full sm:w-64"
          onChange={handleSearch}
        />
        <div className="grid grid-cols-3 gap-3">
          <Select
            placeholder="All type"
            data={["All type", "In-Clinic", "Online", "Completed"]}
            defaultValue="All type"
          />
          <Select
            placeholder="All status"
            data={["All status", "Upcoming", "Checked In"]}
            defaultValue="All status"
          />
          <Select
            placeholder="Timing"
            data={["Timing", "Morning", "Afternoon", "Evening"]}
            defaultValue="Timing"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable<Appointment>
        withTableBorder
        borderRadius="md"
        highlightOnHover
        minHeight={200}
        totalRecords={recordsData.length}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        records={recordsData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
        columns={[
          { accessor: "time", title: "Time", width: 100 },
          {
            accessor: "patient",
            title: "Patient",
            render: (record) => (
              <Group gap="sm">
                <Avatar radius="xl" size="sm" />
                <div>
                  <p className="font-medium">{record.name}</p>
                  <p className="text-xs text-gray-500">{record.details}</p>
                </div>
              </Group>
            ),
          },
          {
            accessor: "type",
            title: "Type",
            render: (record) => (
              <Badge size="lg"
                color={
                  record.type === "Online"
                    ? "#0D52AF"
                    : record.type === "In-Clinic"
                    ? "teal"
                    : "gray"
                }
                variant="light"
              >
                {record.type}
              </Badge>
            ),
          },
          {
            accessor: "amount",
            title: "Amount",
            render: (record) => `₹${record.amount}`,
          },
          {
            accessor: "status",
            title: "Status",
            render: (record) => (
              <Badge size="lg"
                color={record.status === "Upcoming" ? "#0D52AF" : "gray"}
                variant={record.status === "Upcoming" ? "filled" : "light"}
              >
                {record.status}
              </Badge>
            ),
          },
          {
            accessor: "action",
            title: "Action",
            render: (record) => (
              <Button
                variant="subtle"
                color="gray"
                size="compact-xs"
                onClick={() => handleView(record)}
              >
                <IconEye size={16} />
              </Button>
            ),
          },
        ]}
      />

      {/* Drawer */}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Appointment Details"
        position="right"
        size="md"
      >
        {selectedAppointment ? (
            <>
                <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#EAEAEA]">
                    <div className="flex items-center gap-4 mb-2">
                        <Avatar src="/images/Ellipse.webp" alt="it's me" />
                        <div>
                            <div className="text-lg text-black font-semibold">Ananya Sharma</div>
                            <div className="text-sm text-[#74777E]">F, 28, Mumbai</div>
                        </div>
                    </div>
                    <div className="bg-white flex items-center gap-2 p-3 text-[#74777E] border border-[#EAEAEA]">
                        <i>
                            <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.44472 5.58503L5.10068 6.77211C5.27835 7.37074 5.52652 7.94687 5.84015 8.48874C6.16728 9.02666 6.56147 9.52219 7.01354 9.9638L8.75413 9.43585C9.72925 9.13988 10.7938 9.44385 11.4422 10.2038L12.4336 11.3653C12.835 11.8315 13.0362 12.4333 12.9946 13.0431C12.9531 13.6529 12.672 14.2228 12.2109 14.6321C10.5939 16.0848 8.10405 16.576 6.23995 15.1345C4.60088 13.8654 3.21453 12.3087 2.15094 10.5429C1.08464 8.78591 0.370728 6.84378 0.0479279 4.8219C-0.309616 2.54693 1.38222 0.726303 3.49173 0.105564C4.74964 -0.2656 6.09205 0.371138 6.55361 1.55822L7.09805 2.95809C7.4556 3.8796 7.19881 4.91949 6.44472 5.58503Z" fill="#74777E"/>
                            </svg>
                        </i>
                        <span>+91 9876543210</span>
                    </div>
                </div>
                <div className="space-y-3 mt-3">
                    <div className="text-lg text-black font-semibold mb-2">Consultation Details</div>
                    <p>
                        <strong>Reason:</strong> {selectedAppointment.time}
                    </p>
                    <p>
                    <strong>Last Visit:</strong> {selectedAppointment.name}
                    </p>
                    <p>
                    <strong>Age:</strong> {selectedAppointment.details}
                    </p>
                </div>
                <div className="text-lg mt-4 mb-2">Doctor Notes</div>
                <div className="p-4 bg-[#F9F9F9] rounded-lg text-[#74777E]">
                    Patient reports feeling well, blood pressure is stable. Continue with current medication. Advised to monitor BP at home and report any significant changes. Next follow-up in 3 months.
                </div>
          </>
        ) : (
          <p>No appointment selected.</p>
        )}
      </Drawer>
    </>
  );
}
