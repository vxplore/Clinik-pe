import { useState, useEffect, useCallback } from "react";
import AvailabilityTable from "./Components/AvailabilityTable";
import AddAvailabilityModal from "./Components/AddAvailabilityModal";
import apis from "../../APis/Api";
import type { DoctorAvailability, Provider } from "../../APis/Types";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";

// Types
type AvailabilityItem = {
  id: number;
  day: string;
  start: string;
  end: string;
  interval: string;
  type: string;
  status: "Active" | "Inactive";
  providerName?: string;
  providerImage?: string;
};

type OrganizationContext = {
  orgId: string;
  centerId: string;
};

// Utility Functions
const getOrganizationContext = (): OrganizationContext | null => {
  const organizationDetails = useAuthStore.getState().organizationDetails;
  const selectedCenter = useDropdownStore.getState().selectedCenter;

  const orgId = organizationDetails?.organization_id ?? "";
  const centerId =
    selectedCenter?.center_id ?? organizationDetails?.center_id ?? "";

  if (!orgId || !centerId) {
    console.warn("Missing organization or center context", { orgId, centerId });
    return null;
  }

  return { orgId, centerId };
};

const mapAvailabilityToItem = (
  availability: DoctorAvailability,
  index: number
): AvailabilityItem => {
  const status: "Active" | "Inactive" =
    availability.status?.toLowerCase() === "inactive" ? "Inactive" : "Active";

  return {
    id: index + 1,
    day: (availability.week_days || []).join(", "),
    start: availability.start_time,
    end: availability.end_time,
    interval: availability.time_slot_interval,
    type: availability.appointment_type,
    status,
  };
};

// Custom Hooks
const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProviders = async () => {
      const context = getOrganizationContext();
      if (!context) return;

      setIsLoading(true);

      try {
        const response = await apis.GetAllProviders(
          "",
          context.orgId,
          context.centerId,
          undefined,
          1,
          100
        );

        if (isMounted) {
          setProviders(response.data?.providers ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  return { providers, isLoading };
};

const useAvailabilities = () => {
  const [items, setItems] = useState<AvailabilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailabilities = useCallback(async () => {
    const context = getOrganizationContext();
    if (!context) return;

    setIsLoading(true);

    try {
      const response = await apis.GetProviderAvailabilities(
        context.orgId,
        context.centerId,
        "all"
      );

      const availabilities: DoctorAvailability[] =
        response.data?.availabilities ?? [];
      const mapped = availabilities.map(mapAvailabilityToItem);

      setItems(mapped);
    } catch (error) {
      console.error("Failed to fetch availabilities:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  return { items, isLoading, refetch: fetchAvailabilities };
};

// Main Component
const ProviderAvailability = () => {
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    "all"
  );
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { providers, isLoading: providersLoading } = useProviders();
  const {
    items,
    isLoading: availabilitiesLoading,
    refetch,
  } = useAvailabilities();

  const handleAddAvailability = () => {
    setAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
  };

  const handleSaveAvailability = async () => {
    await refetch();
    setAddModalOpen(false);
  };

  const handleProviderChange = (providerId: string | null) => {
    setSelectedProviderId(providerId ?? "all");
  };

  const pageSize = 5;
  const isLoading = providersLoading || availabilitiesLoading;

  return (
    <div className="space-y-6 p-0">
      <AvailabilityTable
        providers={providers}
        selectedProvider={selectedProviderId}
        onProviderChange={handleProviderChange}
        items={items}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        total={items.length}
        providerName="All Providers"
        providerImage={undefined}
        onAdd={handleAddAvailability}
        isLoading={isLoading}
      />

      <AddAvailabilityModal
        opened={addModalOpen}
        onClose={handleCloseModal}
        providers={providers}
        defaultProvider={
          selectedProviderId === "all" ? null : selectedProviderId
        }
        onSaved={handleSaveAvailability}
      />
    </div>
  );
};

export default ProviderAvailability;
