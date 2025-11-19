import React, { useState, useEffect } from "react";
import { Select, TextInput, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import useDropdownStore from "../../../GlobalStore/useDropdownStore";
import type {
  Patient,
  PatientListResponse,
  Provider,
  ProviderListResponse,
} from "../../../APis/Types";

interface AppointmentDetails {
  selectedPatientId: string;
  clinicName: string;
  provider: string;
}

interface AppointmentDetailsSectionProps {
  data: AppointmentDetails;
  onChange: (data: Partial<AppointmentDetails>) => void;
  onShowAddPatient?: () => void;
  refreshTrigger?: number; // Add this to trigger refetch from parent
}

interface PatientOption {
  value: string;
  label: string;
}

const AppointmentDetailsSection: React.FC<AppointmentDetailsSectionProps> = ({
  data,
  onChange,
  onShowAddPatient,
  refreshTrigger,
}) => {
  const { organizationDetails } = useAuthStore();
  const { selectedCenter } = useDropdownStore();

  // State for dropdown options
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [providerOptions, setProviderOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Loading states
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Computed values
  const orgId = organizationDetails?.organization_id;
  const centerId = selectedCenter?.center_id || organizationDetails?.center_id;
  const clinicName = organizationDetails?.center_name || "No Clinic Selected";
  const canFetchData = Boolean(orgId && centerId);

  // Fetch Patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!canFetchData) return;

      setLoadingPatients(true);
      try {
        const resp = await apis.GetPatients(
          orgId!,
          centerId!,
          undefined,
          1,
          100,
          ["uid", "name"]
        );

        const respTyped = resp as PatientListResponse;
        const patientsRaw = respTyped?.data?.patients || [];
        const options = Array.isArray(patientsRaw)
          ? patientsRaw
              .filter((p: Patient) => p.uid && p.name)
              .map((p: Patient) => ({
                value: p.uid as string,
                label: p.name as string,
              }))
          : [];
        setPatientOptions(options);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [orgId, centerId, canFetchData, refreshTrigger]);

  // Fetch Providers
  useEffect(() => {
    const fetchProviders = async () => {
      if (!canFetchData) return;
      setLoadingProviders(true);
      try {
        const resp = (await apis.GetAllProviders(
          "doctor",
          orgId!,
          centerId!
        )) as ProviderListResponse;
        const providersRaw = resp?.data?.providers || [];
        const options = Array.isArray(providersRaw)
          ? providersRaw
              .filter((p: Provider) => p.uid && p.name)
              .map((p: Provider) => ({ value: p.uid as string, label: p.name }))
          : [];
        setProviderOptions(options);
      } catch (err) {
        console.error("Failed to fetch providers:", err);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
  }, [orgId, centerId, canFetchData, refreshTrigger]);

  // Update clinic name when component mounts or center changes
  useEffect(() => {
    if (clinicName && clinicName !== data.clinicName) {
      onChange({ clinicName });
    }
  }, [clinicName, data.clinicName, onChange]);

  const handleProviderChange = (val: string | null) => {
    onChange({ provider: val || "" });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm mr-2">
            1
          </span>
          Patient details
        </h3>
        <Button
          size="sm"
          variant="outline"
          leftSection={<IconPlus size={16} />}
          onClick={() => onShowAddPatient && onShowAddPatient()}
        >
          Add Patient
        </Button>
      </div>

      <div className="space-y-4">
        {/* Patient & Provider */}
        <div className="grid md:grid-cols-1 grid-cols-1 gap-4">
          <Select
            searchable
            label="Patient"
            placeholder="Select Patient"
            value={data.selectedPatientId}
            data={patientOptions}
            onChange={(val) => onChange({ selectedPatientId: val || "" })}
            disabled={loadingPatients}
          />
        </div>

        {/* Clinic Name */}
        <div className="grid md:grid-cols-1 grid-cols-1 gap-4">
          <TextInput
            label="Clinic Name"
            placeholder="Clinic Name"
            value={data.clinicName}
            disabled
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsSection;
