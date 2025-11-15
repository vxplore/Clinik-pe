import React, { useState, useEffect, useCallback } from "react";
import { Drawer, TextInput, Select, Button, Grid } from "@mantine/core";
import FeeTable from "./Components/FeeTable";
import type { FeeRow } from "./Components/FeeTable";
import apis from "../../APis/Api";
import type { Provider, DoctorCommissionPayload } from "../../APis/Types";
import useAuthStore from "../../GlobalStore/store";

const APPOINTMENT_TYPES = [
  { label: "Video Call", value: "Video Call" },
  { label: "Chat", value: "Chat" },
  { label: "Offline", value: "Offline" },
] as const;

const COMMISSION_TYPES = ["Flat", "%"] as const;

const PAGE_SIZE = 10;

interface FormState {
  providerUid: string;
  appointmentType: string;
  feeAmount: number | null;
  commissionType: string;
  commission: number | null;
}

const INITIAL_FORM_STATE: FormState = {
  providerUid: "",
  appointmentType: "",
  feeAmount: null,
  commissionType: "Flat",
  commission: null,
};

const FeeManagement: React.FC = () => {
  const organizationDetails = useAuthStore(
    (state) => state.organizationDetails
  );

  const [fees, setFees] = useState<FeeRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);

  const hasRequiredOrgDetails = Boolean(
    organizationDetails?.organization_id && organizationDetails?.center_id
  );

  const transformFeeData = useCallback((feeList: any[]): FeeRow[] => {
    return feeList.map((fee) => ({
      id: fee.uid || fee.id,
      orgId: fee.organization_id,
      centerId: fee.center_id,
      provider: fee.doctor_name,
      appointmentType: fee.appointment_type,
      fee: fee.fee ? `₹${fee.fee}` : "₹0",
      commissionType: fee.commission_type,
      commission:
        fee.commission_type === "%"
          ? `${fee.commission ?? 0}%`
          : `₹${fee.commission ?? 0}`,
    }));
  }, []);

  const fetchFees = useCallback(
    async (page: number) => {
      if (!hasRequiredOrgDetails) {
        setFees([]);
        setTotalRecords(0);
        return;
      }

      try {
        const response = await apis.GetFees(
          organizationDetails.organization_id,
          organizationDetails.center_id,
          PAGE_SIZE,
          page
        );

        if (response?.success && response.data) {
          const feeList = response.data.provider_fee_list || [];
          const transformedFees = transformFeeData(feeList);

          setFees(transformedFees);
          setTotalRecords(
            response.data.pagination?.totalRecords ?? transformedFees.length
          );
          setCurrentPage(response.data.pagination?.page ?? page);
        } else {
          setFees([]);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error("Failed to fetch fees:", error);
        setFees([]);
        setTotalRecords(0);
      }
    },
    [hasRequiredOrgDetails, organizationDetails, transformFeeData]
  );

  const fetchProviders = useCallback(async () => {
    if (!hasRequiredOrgDetails) return;

    setIsLoadingProviders(true);
    try {
      const response = await apis.GetAllProviders(
        "basic",
        organizationDetails.organization_id,
        organizationDetails.center_id,
        undefined,
        1,
        100
      );

      if (response?.success && response.data?.providers) {
        setProviders(response.data.providers);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
      setProviders([]);
    } finally {
      setIsLoadingProviders(false);
    }
  }, [hasRequiredOrgDetails, organizationDetails]);

  useEffect(() => {
    fetchFees(currentPage);
  }, [fetchFees, currentPage]);

  useEffect(() => {
    if (isDrawerOpen) {
      fetchProviders();
    }
  }, [isDrawerOpen, fetchProviders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setFormState(INITIAL_FORM_STATE);
  };

  const updateFormField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    return Boolean(
      formState.providerUid &&
        formState.appointmentType &&
        formState.feeAmount !== null &&
        formState.feeAmount > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.error("Please fill all required fields with valid values");
      return;
    }

    if (!hasRequiredOrgDetails) {
      console.error("Missing organization or center details");
      return;
    }

    const payload: DoctorCommissionPayload = {
      doctor_id: formState.providerUid,
      appointment_type: formState.appointmentType,
      fee_amount: String(formState.feeAmount),
      commission_type: formState.commissionType,
      commission: String(formState.commission ?? 0),
    };

    setIsSubmitting(true);
    try {
      const response = await apis.AddFee(
        organizationDetails.organization_id,
        organizationDetails.center_id,
        payload
      );

      if (response?.success) {
        await fetchFees(currentPage);
        handleDrawerClose();
      }
    } catch (error) {
      console.error("Failed to save fee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const providerOptions = providers.map((provider) => ({
    label: provider.name,
    value: provider.uid,
  }));

  return (
    <div className="p-2">
      <FeeTable
        data={fees}
        total={totalRecords}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onAdd={handleDrawerOpen}
        onPageChange={handlePageChange}
      />

      <Drawer
        position="right"
        opened={isDrawerOpen}
        onClose={handleDrawerClose}
        title="Fee Details"
        padding="md"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="Organization"
                value={organizationDetails?.organization_name}
                disabled
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Center"
                value={organizationDetails?.center_name}
                disabled
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Provider"
                data={providerOptions}
                placeholder={
                  isLoadingProviders ? "Loading..." : "Select provider"
                }
                searchable
                required
                disabled={isLoadingProviders}
                value={formState.providerUid}
                onChange={(value) =>
                  updateFormField("providerUid", value || "")
                }
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Appointment Type"
                data={APPOINTMENT_TYPES}
                placeholder="Select appointment type"
                required
                value={formState.appointmentType}
                onChange={(value) =>
                  updateFormField("appointmentType", value || "")
                }
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Fee Amount"
                placeholder="100"
                required
                type="number"
                min={0}
                value={formState.feeAmount ?? ""}
                onChange={(e) =>
                  updateFormField(
                    "feeAmount",
                    e.currentTarget.value ? Number(e.currentTarget.value) : null
                  )
                }
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Commission Type"
                data={[...COMMISSION_TYPES]}
                value={formState.commissionType}
                onChange={(value) =>
                  updateFormField("commissionType", value || "Flat")
                }
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Commission"
                placeholder="50"
                type="number"
                min={0}
                value={formState.commission ?? ""}
                onChange={(e) =>
                  updateFormField(
                    "commission",
                    e.currentTarget.value ? Number(e.currentTarget.value) : null
                  )
                }
              />
            </Grid.Col>
          </Grid>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="default" onClick={handleDrawerClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default FeeManagement;
