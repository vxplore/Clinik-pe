import React, { useState } from "react";
import { Button, Anchor, Text, Paper, Drawer } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import AppointmentDetailsSection from "./Components/AppointmentDetailsSection";
import CaseDetailsSection from "./Components/CaseDetailsSection";
import SettingsModal from "./Components/SettingsModal";
import AddPatientScheduling from "../PatientShedule/Components/AddPatientScheduling";
import type { PaymentDetails as PaymentDetailsType } from "./Components/PaymentDetailsSection";
import type { LabInvestigationItem, InvoicePayload } from "../../APis/Types";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";

interface AppointmentDetails {
  selectedPatientId: string;
  provider: string;
  clinicName: string;
  appointmentType: string;
  selectedSymptomIds: string[];
  others: string;
  selectedDate: string;
}

interface PerInvestigationData {
  selectedItems: LabInvestigationItem[]; // Array of selected lab investigation objects
  amount: string; // Total bill amount (calculated from selectedItems)
  paid: string; // Amount actually paid
  discount: string; // Per-investigation discount
  sampleCollectedAt: string;
  total?: number;
}

type PaymentDetails = PaymentDetailsType;

interface CaseDetails {
  referredBy: string;
  collectionCentre: string;
  sampleCollectionAgent: string;
  selectedInvestigations: string[];
  perInvestigationData: Record<string, PerInvestigationData>;
  payment: PaymentDetails;
}

const AddDiagnosticBillsPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizationDetails } = useAuthStore();
  const selectedCenter = useDropdownStore((s) => s.selectedCenter);
  const orgId = organizationDetails?.organization_id;
  const centerId = selectedCenter?.center_id || organizationDetails?.center_id;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAddPatientDrawer, setShowAddPatientDrawer] = useState(false);
  const [patientRefreshTrigger, setPatientRefreshTrigger] = useState(0);

  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails>({
      selectedPatientId: "",
      provider: "",
      clinicName: "",
      appointmentType: "medical",
      selectedSymptomIds: [],
      others: "",
      selectedDate: "",
    });

  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    referredBy: "",
    collectionCentre: "",
    sampleCollectionAgent: "",
    selectedInvestigations: [],
    perInvestigationData: {},
    payment: {
      total: 0,
      discount: 0,
      centerDiscount: 0,
      referrerDiscount: 0,
      discountType: "rupee",
      amountReceived: 0,
      balance: 0,
      mode: "cash",
      remarks: "",
    },
  });

  const handleAppointmentDetailsChange = (
    data: Partial<AppointmentDetails>
  ) => {
    setAppointmentDetails((prev) => ({ ...prev, ...data }));
  };

  const handleCaseDetailsChange = (data: Partial<CaseDetails>) => {
    setCaseDetails((prev) => {
      const merged = { ...prev, ...data } as CaseDetails;
      // recompute total and balance using perInvestigationData
      const per = merged.perInvestigationData || {};

      // Calculate total from all investigation 'amount' field (original bill amount)
      const total = Object.values(per).reduce((sum, item) => {
        const amountValue = Number(item.amount ?? item.paid ?? 0);
        return sum + amountValue;
      }, 0);

      // Calculate total discount from all investigations (converted to rupee if percent)
      const investigationDiscount = Object.values(per).reduce((sum, item) => {
        const discountValue = Number(item.discount ?? 0);
        if (merged.payment?.discountType === "percent") {
          const baseAmount = Number(item.paid ?? item.amount ?? 0);
          return sum + (discountValue / 100) * baseAmount;
        }
        return sum + discountValue;
      }, 0);

      // Calculate amountReceived (sum of what was actually paid from investigations)
      const perPaidSum = Object.values(per).reduce((sum, item) => {
        const paidAmount = Number(item.paid ?? 0);
        return sum + paidAmount;
      }, 0);

      // Calculate payment level discount (flat or percent)
      const centerDiscount = merged.payment?.centerDiscount ?? 0;
      const referrerDiscount = merged.payment?.referrerDiscount ?? 0;
      // Calculate payment level discount value (will be computed after we determine the display discount)

      // final discount includes per-investigation, center and referrer discounts, and any payment-level discount

      // Calculate per-investigation rupee discount + center/referrer discounts (re-used in conversions)
      const perDiscountRupee =
        investigationDiscount + centerDiscount + referrerDiscount;

      // Determine if user explicitly supplied payment.discount (override) or payment.amountReceived
      // We'll also detect if we converted a pre-existing top-level discount during a discountType toggle
      let forcedUserSuppliedDiscount = false;
      const userSuppliedPaymentDiscount = !!(
        data.payment &&
        Object.prototype.hasOwnProperty.call(data.payment, "discount")
      );
      const userSuppliedAmountReceived = !!(
        data.payment &&
        Object.prototype.hasOwnProperty.call(data.payment, "amountReceived")
      );
      const discountTypeChanged = !!(
        data.payment &&
        Object.prototype.hasOwnProperty.call(data.payment, "discountType") &&
        merged.payment?.discountType !== prev.payment?.discountType
      );

      // If discount type is toggled, convert the currently stored discount to the new type
      const oldDiscountType = prev.payment?.discountType ?? "rupee";
      const newDiscountType = merged.payment?.discountType ?? oldDiscountType;
      if (
        data.payment &&
        Object.prototype.hasOwnProperty.call(data.payment, "discountType") &&
        newDiscountType !== oldDiscountType
      ) {
        // convert prev payment discount value to new unit
        const prevDiscountVal = prev.payment?.discount ?? 0;
        // Determine if previous top-level discount matches the computed per-investigation discount display
        const prevDiscountType = prev.payment?.discountType ?? "rupee";
        let prevExpectedDisplay = 0;
        if (prevDiscountType === "percent") {
          prevExpectedDisplay =
            total > 0 ? (perDiscountRupee / total) * 100 : 0;
        } else {
          prevExpectedDisplay = perDiscountRupee;
        }
        const prevDiscountIsCustom =
          Math.abs(prevDiscountVal - prevExpectedDisplay) > 1e-6;
        if (prevDiscountIsCustom && prevDiscountVal !== 0) {
          forcedUserSuppliedDiscount = true;
        }
        if (oldDiscountType === "rupee" && newDiscountType === "percent") {
          // rupee -> percent
          merged.payment = {
            ...merged.payment,
            discount: total > 0 ? (prevDiscountVal / total) * 100 : 0,
          };
        } else if (
          oldDiscountType === "percent" &&
          newDiscountType === "rupee"
        ) {
          // percent -> rupee
          merged.payment = {
            ...merged.payment,
            discount: ((prevDiscountVal ?? 0) / 100) * total,
          };
        }
      }

      // If the user didn't provide a new top-level payment.discount, compute the display value depending on discountType
      let displayPaymentDiscount = merged.payment.discount ?? 0;
      if (!userSuppliedPaymentDiscount && !forcedUserSuppliedDiscount) {
        if (merged.payment?.discountType === "percent") {
          displayPaymentDiscount =
            total > 0 ? (perDiscountRupee / total) * 100 : 0;
        } else {
          displayPaymentDiscount = perDiscountRupee;
        }
      }
      // Round display value to 2 decimals for nicer UI
      displayPaymentDiscount = Number(
        Number(displayPaymentDiscount ?? 0).toFixed(2)
      );
      // effectivePaymentDiscount not needed; we use paymentDiscountValue (rupee) for calculations and displayPaymentDiscount for UI

      // Determine rupee value of the payment-level discount (for calculations)
      const userPaymentRupeeValue =
        userSuppliedPaymentDiscount || forcedUserSuppliedDiscount
          ? merged.payment?.discountType === "percent"
            ? ((merged.payment?.discount ?? 0) / 100) * total
            : merged.payment?.discount ?? 0
          : 0;
      const rupeePaymentDiscountValue =
        perDiscountRupee + userPaymentRupeeValue;

      // Calculate amountReceived: prefer user-supplied top-level payment.amountReceived, otherwise compute from per-paid sums minus rupee final discount
      const calculatedAmountReceived = Math.max(
        0,
        perPaidSum - rupeePaymentDiscountValue
      );
      const amountReceived =
        userSuppliedAmountReceived && !discountTypeChanged
          ? merged.payment.amountReceived
          : calculatedAmountReceived;

      // Calculate balance: Total - Amount Received
      const balance = Math.max(0, total - amountReceived);

      merged.payment = {
        ...merged.payment,
        total,
        // store the aggregated discount (in units relevant to discountType) unless user explicitly set a different one
        discount: displayPaymentDiscount,
        amountReceived: Number(Number(amountReceived ?? 0).toFixed(2)),
        balance: Number(Number(balance ?? 0).toFixed(2)),
      };
      return merged;
    });
  };

  const handleShowAddPatient = () => {
    setShowAddPatientDrawer(true);
  };

  const handlePatientAdded = () => {
    // Trigger refetch in AppointmentDetailsSection
    setPatientRefreshTrigger((prev) => prev + 1);
    setShowAddPatientDrawer(false);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!appointmentDetails.selectedPatientId) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a patient",
        color: "red",
      });
      return;
    }

    if (!caseDetails.referredBy) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a provider",
        color: "red",
      });
      return;
    }

    // Build items array from perInvestigationData
    const items: InvoicePayload["items"] = [];
    Object.values(caseDetails.perInvestigationData).forEach((invData) => {
      invData.selectedItems?.forEach((item) => {
        // type from API response (panel/test/package) becomes sub_type in payload
        // type in payload should always be "lab" since investigation field is "lab"
        items.push({
          type: item.investigation as "panel" | "test", // Use investigation field as type
          sub_type: item.type, // Use type field as sub_type (panel/test/package)
          item_id: item.uid,
          amount: item.amount,
        });
      });
    });

    if (items.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "Please select at least one investigation",
        color: "red",
      });
      return;
    }

    // Build payload
    const discountUnit: "percentage" | "flat" =
      caseDetails.payment.discountType === "percent" ? "percentage" : "flat";

    const payload: InvoicePayload = {
      patient_id: appointmentDetails.selectedPatientId,
      total_amount: caseDetails.payment.total,
      discount_unit: discountUnit,
      discount_value: caseDetails.payment.discount,
      referred_by_doctor_id: caseDetails.referredBy || null,
      referrer_details: "",
      payable_amount: caseDetails.payment.amountReceived,
      items,
    };

    try {
      if (!orgId || !centerId) {
        notifications.show({
          title: "Error",
          message: "Organization or center not found",
          color: "red",
        });
        return;
      }

      const response = await apis.Addbilling(orgId, centerId, payload);

      if (response.success) {
        notifications.show({
          title: "Success",
          message: response.message,
          color: "green",
        });
      } else {
        notifications.show({
          title: "Error",
          message: response.message,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      notifications.show({
        title: "Error",
        message: "Failed to create bill. Please try again.",
        color: "red",
      });
    }
  };

  const handleSaveSettings = (data: Partial<PaymentDetails>) => {
    handleCaseDetailsChange({ payment: { ...caseDetails.payment, ...data } });
  };

  return (
    <div className="p-0">
      {/* Header with Back Button */}
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Bills
          </Text>
        </Anchor>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">New bill</h2>
            <p className="text-sm text-gray-600">
              Create a new diagnostic bill by entering patient and case details.
            </p>
          </div>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Appointment Details Section */}
        <AppointmentDetailsSection
          data={appointmentDetails}
          onChange={handleAppointmentDetailsChange}
          onShowAddPatient={handleShowAddPatient}
          refreshTrigger={patientRefreshTrigger}
        />

        {/* Case Details Section */}
        <CaseDetailsSection
          data={caseDetails}
          onChange={handleCaseDetailsChange}
        />

        {/* Action Buttons */}
        <Paper withBorder radius="md" className="p-6">
          <div className="flex justify-between gap-3">
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                variant="filled"
                color="blue"
                size="md"
              >
                Save Bill
              </Button>
              <Button onClick={() => navigate(-1)} variant="default" size="md">
                Cancel
              </Button>
            </div>
            <div>
              <Button onClick={() => setIsSettingsOpen(true)}>Settings</Button>
            </div>
          </div>
        </Paper>

        {/* Settings Modal */}
        <SettingsModal
          opened={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          payment={caseDetails.payment}
          onSave={handleSaveSettings}
        />
      </div>

      {/* Add Patient Drawer */}
      <Drawer
        opened={showAddPatientDrawer}
        onClose={() => setShowAddPatientDrawer(false)}
        position="right"
        size="xl"
        title={<span className="text-xl font-semibold">Add Patient</span>}
      >
        <AddPatientScheduling
          onClose={() => setShowAddPatientDrawer(false)}
          onPatientAdded={handlePatientAdded}
        />
      </Drawer>
    </div>
  );
};

export default AddDiagnosticBillsPage;
