import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Paper, Button, Text, Anchor, Select, Modal } from "@mantine/core";
import { IconArrowLeft, IconClock, IconTrash } from "@tabler/icons-react";
import Notification from "../../components/Global/Notification";
import apis from "../../APis/Api";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import type { DoctorAvailability } from "../../APis/Types";

// Reset: Complete file rewrite to fix duplicate exports

interface AvailabilityRow {
  id: string;
  days: string[]; // allow multiple days per slot
  startTime: string;
  endTime: string;
  interval: string;
  type: string;
}

const AddProviderAvailability: React.FC = () => {
  const navigate = useNavigate();

  // Provider selector state
  const { providerUid } = useParams<{ providerUid: string }>();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Modal state for adding new slot
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [modalStartTime, setModalStartTime] = useState("09:00");
  const [modalEndTime, setModalEndTime] = useState("17:00");
  const [modalInterval, setModalInterval] = useState("15");
  const [modalType, setModalType] = useState("in-clinic");

  const [rows, setRows] = useState<AvailabilityRow[]>([
    {
      id: "1",
      days: ["Monday"],
      startTime: "09:00",
      endTime: "17:00",
      interval: "15",
      type: "in-clinic",
    },
  ]);

  // fetch existing availabilities for provider when provider id is available
  useEffect(() => {
    // read providerUid from route path parameter
    if (providerUid) {
      setSelectedProvider(providerUid);
      fetchAvailabilities(providerUid);
    }
  }, [providerUid]);

  const fetchAvailabilities = async (providerUid: string) => {
    try {
      const resp = await apis.GetProviderAvailabilities(providerUid);
      const data = (resp?.data?.availabilities ?? []) as DoctorAvailability[];

      // Helper to convert AM/PM to 24-hour format
      const convertTo24Hour = (timeStr: string): string => {
        if (!timeStr) return "";
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return timeStr; // assume already 24-hour
        const hh = match[1];
        const mm = match[2];
        const ampm = match[3];
        let hour = parseInt(hh, 10);
        if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
        if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
        return `${String(hour).padStart(2, "0")}:${mm}`;
      };

      // Helper to format appointment type
      const formatAppointmentType = (type: string): string => {
        return type; // Keep as is, since options are now lowercase
      };

      const mapped: AvailabilityRow[] = data.map((d) => ({
        id: d.uid,
        days: d.week_days ?? [],
        startTime: convertTo24Hour(d.start_time ?? ""),
        endTime: convertTo24Hour(d.end_time ?? ""),
        interval: String(d.time_slot_interval ?? ""),
        type: formatAppointmentType(d.appointment_type ?? ""),
      }));
      setRows(mapped);
    } catch (err) {
      console.error("Error fetching availabilities:", err);
    }
  };

  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({
    open: false,
    data: { success: true, message: "" },
  });

  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const intervalOptions = ["10", "15", "20", "30", "45", "60"];
  const typeOptions = ["in-clinic", "online", "both"];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSlot = () => {
    if (selectedDays.length === 0) {
      setNotif({
        open: true,
        data: { success: false, message: "Please select at least one day" },
      });
      return;
    }

    // Create a single grouped row representing the selected days
    const newId = String(Math.max(...rows.map((r) => parseInt(r.id)), 0) + 1);
    const newRow: AvailabilityRow = {
      id: newId,
      days: selectedDays.slice(),
      startTime: modalStartTime,
      endTime: modalEndTime,
      interval: modalInterval,
      type: modalType,
    };

    setRows((prev) => [...prev, newRow]);

    // Reset modal state
    setSelectedDays([]);
    setModalStartTime("09:00");
    setModalEndTime("17:00");
    setModalInterval("15");
    setModalType("in-clinic");
    setModalOpened(false);

    setNotif({
      open: true,
      data: {
        success: true,
        message: `Added availability for ${selectedDays.length} day(s)`,
      },
    });
  };

  const handleRowChange = (
    id: string,
    field: Exclude<keyof AvailabilityRow, "days">,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const toggleDayInRow = (id: string, day: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const has = row.days.includes(day);
        const nextDays = has
          ? row.days.filter((d) => d !== day)
          : [...row.days, day];
        return { ...row, days: nextDays };
      })
    );
  };

  const deleteRow = (id: string) => {
    if (rows.length === 1) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: "At least one availability slot is required",
        },
      });
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const validateForm = (): boolean => {
    for (const row of rows) {
      if (!row.days || row.days.length === 0) {
        setNotif({
          open: true,
          data: {
            success: false,
            message: "Please select day(s) for all rows",
          },
        });
        return false;
      }

      if (!row.startTime || !row.endTime) {
        setNotif({
          open: true,
          data: { success: false, message: "Please enter start and end times" },
        });
        return false;
      }

      if (row.startTime >= row.endTime) {
        setNotif({
          open: true,
          data: {
            success: false,
            message: "Start time must be before end time",
          },
        });
        return false;
      }

      if (!row.interval || !row.type) {
        setNotif({
          open: true,
          data: {
            success: false,
            message: "Please select interval and type for all rows",
          },
        });
        return false;
      }
    }
    return true;
  };

  const buildPayload = () => {
    // convert 24h "HH:MM" to "hh:MM AM/PM"
    const formatTime = (t: string) => {
      if (!t) return t;
      const [hhStr, mm] = t.split(":");
      let hh = parseInt(hhStr, 10);
      const ampm = hh >= 12 ? "PM" : "AM";
      if (hh === 0) hh = 12;
      if (hh > 12) hh = hh - 12;
      const hhOut = String(hh).padStart(2, "0");
      return `${hhOut}:${mm} ${ampm}`;
    };

    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const compressDays = (days: string[]) => {
      if (!days || days.length === 0) return [] as string[];
      const idxs = days
        .map((d) => dayOrder.indexOf(d))
        .filter((i) => i >= 0)
        .sort((a, b) => a - b);
      if (idxs.length === 0) return days;
      let contiguous = true;
      for (let i = 1; i < idxs.length; i++) {
        if (idxs[i] !== idxs[i - 1] + 1) {
          contiguous = false;
          break;
        }
      }
      if (contiguous && idxs.length > 1) {
        return [`${dayOrder[idxs[0]]} - ${dayOrder[idxs[idxs.length - 1]]}`];
      }
      return days;
    };

    const selectedCenter = useDropdownStore.getState().selectedCenter;
    const center_id = selectedCenter?.center_id ?? "";

    const payloadArray = rows.map((row) => {
      const week_days = compressDays(row.days);
      const times = [
        `${formatTime(row.startTime)} - ${formatTime(row.endTime)}`,
      ];
      return {
        week_days,
        times,
        time_slot_interval: String(row.interval),
        appointment_type: row.type.toLowerCase().replace(/\s+/g, "-"),
        speciality_id: "",
        center_id,
      } as {
        week_days: string[];
        times: string[];
        time_slot_interval: string;
        appointment_type: string;
        speciality_id: string;
        center_id: string;
      };
    });
    console.log("Built payload array:", payloadArray);
    return payloadArray;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payloadArray = buildPayload();
    const response = await apis.AddDoctorAvailability(
      selectedProvider || "",
      payloadArray
    );

    if (response.success) {
      setNotif({
        open: true,
        data: { success: response.success, message: response.message },
      });
      setTimeout(
        () =>
          navigate(`/availability/${encodeURIComponent(String(providerUid))}`),
        1500
      );
    } else {
      setNotif({
        open: true,
        data: { success: response.success, message: response.message },
      });
    }
    console.log("API response for adding availability:", response);

    try {
      // Get provider id from selectedProvider (your provider options should store uid)
      const providerId = selectedProvider || "";
      if (!providerId) {
        setNotif({
          open: true,
          data: { success: false, message: "Select a provider" },
        });
        return;
      }

      // For now: just log the exact payload structure the backend expects.
      // center_id is pulled from the current selected center in the dropdown store.
      console.log(
        "Will POST to provider",
        providerId,
        "with payload:",
        payloadArray
      );
      setNotif({
        open: true,
        data: { success: true, message: "Payload constructed and logged." },
      });
      setTimeout(() => setNotif((s) => ({ ...s, open: false })), 1500);
      return;
    } catch (err) {
      console.error(err);
      setNotif({
        open: true,
        data: {
          success: false,
          message: (err as Error).message || "Error adding availability",
        },
      });
    }
  };

  return (
    <div className="p-0">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />

      {/* Back Button */}
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() =>
            navigate(`/availability/${encodeURIComponent(String(providerUid))}`)
          }
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Availability
          </Text>
        </Anchor>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Add Provider Availability
        </h2>
        <p className="text-sm text-gray-600">
          Set your availability schedule for appointments.
        </p>
      </div>

      {/* Form Card */}
      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Divider */}

          {/* Availability Section */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <IconClock size={18} />
              Availability
            </h3>

            <div className="space-y-4">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Text size="sm" fw={500} className="text-gray-700">
                      Slot {index + 1}
                    </Text>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteRow(row.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label="Delete row"
                      >
                        <IconTrash size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {dayOptions.map((d) => {
                          const active = row.days.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleDayInRow(row.id, d)}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                active
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                              }`}
                            >
                              {d.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Start Time */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) =>
                            handleRowChange(row.id, "startTime", e.target.value)
                          }
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) =>
                            handleRowChange(row.id, "endTime", e.target.value)
                          }
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Interval */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Interval (mins){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Select
                          placeholder="Select interval"
                          data={intervalOptions}
                          value={row.interval}
                          onChange={(val) =>
                            handleRowChange(row.id, "interval", val || "")
                          }
                          classNames={{
                            input:
                              "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                          }}
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Type <span className="text-red-500">*</span>
                        </label>
                        <Select
                          placeholder="Select type"
                          data={typeOptions}
                          value={row.type}
                          onChange={(val) =>
                            handleRowChange(row.id, "type", val || "")
                          }
                          classNames={{
                            input:
                              "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Row Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setModalOpened(true)}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                + Add Availability
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Submit Button */}
          <div className="flex justify-start gap-3">
            <Button
              type="submit"
              variant="filled"
              color="blue"
              className="px-6 py-2 rounded-md"
            >
              Save Availability
            </Button>
            <Button
              type="button"
              variant="light"
              onClick={() =>
                navigate(
                  `/availability/${encodeURIComponent(String(providerUid))}`
                )
              }
              className="px-6 py-2 rounded-md"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Paper>

      {/* Add Availability Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Add New Availability"
        centered
        w={"600px"}
        size="lg"
      >
        <div className="space-y-6">
          {/* Step 1: Select Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Step 1: Select Days
            </label>
            <div className="grid grid-cols-4 gap-2">
              {dayOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 rounded-md font-medium text-sm transition-colors ${
                    selectedDays.includes(day)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-200"></div>

          {/* Step 2: Set Time & Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Step 2: Set Time & Type
            </label>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Start Time */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={modalStartTime}
                  onChange={(e) => setModalStartTime(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={modalEndTime}
                  onChange={(e) => setModalEndTime(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Interval */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Time Slot Interval <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Select interval"
                  data={intervalOptions}
                  value={modalInterval}
                  onChange={(val) => setModalInterval(val || "15")}
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                  }}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Appointment Type <span className="text-red-500">*</span>
                </label>
                <Select
                  placeholder="Select type"
                  data={typeOptions}
                  value={modalType}
                  onChange={(val) => setModalType(val || "in-clinic")}
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="light"
              onClick={() => setModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="filled"
              color="blue"
              onClick={handleAddSlot}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddProviderAvailability;
