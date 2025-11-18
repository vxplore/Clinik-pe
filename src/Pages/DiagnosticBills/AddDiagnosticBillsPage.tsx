import React, { useState } from "react";
import { Button, Anchor, Text, Paper } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import PatientDetailsSection from "./Components/PatientDetailsSection";
import CaseDetailsSection from "./Components/CaseDetailsSection";
import SettingsModal from "./Components/SettingsModal";
import type { PaymentDetails as PaymentDetailsType } from "./Components/PaymentDetailsSection";

interface PatientDetails {
  mobileNumber: string;
  title: string;
  firstName: string;
  lastName: string;
  sex: "male" | "female" | "other" | "";
  ageYears: string;
  ageMonths: string;
  ageDays: string;
  onlineReportRequested: boolean;
  email: string;
  address: string;
  aadhaar: string;
  patientHistory: string;
}

interface PerInvestigationData {
  investigations: string;
  paid: string;
  discount: string;
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    mobileNumber: "",
    title: "",
    firstName: "",
    lastName: "",
    sex: "",
    ageYears: "",
    ageMonths: "",
    ageDays: "",
    onlineReportRequested: false,
    email: "",
    address: "",
    aadhaar: "",
    patientHistory: "",
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

  const handlePatientDetailsChange = (data: Partial<PatientDetails>) => {
    setPatientDetails((prev) => ({ ...prev, ...data }));
  };

  const handleCaseDetailsChange = (data: Partial<CaseDetails>) => {
    setCaseDetails((prev) => {
      const merged = { ...prev, ...data } as CaseDetails;
      // recompute total and balance using perInvestigationData
      const per = merged.perInvestigationData || {};
      const total = Object.values(per).reduce((sum, item) => {
        // try to sum paid as number; if total field is set, use that
        const t = Number(item.total ?? 0);
        const paid = Number(item.paid ?? 0);
        const add = t || paid;
        return sum + add;
      }, 0);
      const discount =
        (merged.payment?.discount ?? 0) +
        (merged.payment?.centerDiscount ?? 0) +
        (merged.payment?.referrerDiscount ?? 0);
      const amountReceived = merged.payment?.amountReceived ?? 0;
      const balance = Math.max(0, total - amountReceived - discount);
      merged.payment = { ...merged.payment, total, balance };
      return merged;
    });
  };

  const handleSubmit = async () => {
    // Validate form
    if (!patientDetails.firstName || !patientDetails.sex) {
      alert("Please fill in all required fields");
      return;
    }

    // Submit form
    console.log("Submitting:", { patientDetails, caseDetails });
    // Add API call here
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
        {/* Patient Details Section */}
        <PatientDetailsSection
          data={patientDetails}
          onChange={handlePatientDetailsChange}
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
    </div>
  );
};

export default AddDiagnosticBillsPage;
