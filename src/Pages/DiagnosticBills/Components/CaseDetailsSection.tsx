import React from "react";
import { Button, Select, TextInput, Textarea } from "@mantine/core";
import PaymentDetailsSection from "./PaymentDetailsSection";
import type { PaymentDetails } from "./PaymentDetailsSection";
import { IconPlus } from "@tabler/icons-react";

interface InvestigationType {
  id: string;
  name: string;
  icon: string;
}

interface PerInvestigationData {
  investigations: string;
  paid: string;
  discount: string;
  sampleCollectedAt: string;
  total?: number;
}

interface CaseDetails {
  referredBy: string;
  collectionCentre: string;
  sampleCollectionAgent: string;
  selectedInvestigations: string[];
  perInvestigationData: Record<string, PerInvestigationData>;
  payment: PaymentDetails;
}

interface CaseDetailsSectionProps {
  data: CaseDetails;
  onChange: (data: Partial<CaseDetails>) => void;
}

const investigationTypes: InvestigationType[] = [
  { id: "lab", name: "LAB", icon: "🔬" },
  { id: "usg", name: "USG", icon: "📡" },
  { id: "digital-xray", name: "DIGITAL XRAY", icon: "📷" },
  { id: "xray", name: "XRAY", icon: "☢️" },
  { id: "outsource-lab", name: "OUTSOURCE LAB", icon: "🏢" },
  { id: "ecg", name: "ECG", icon: "❤️" },
  { id: "ct-scan", name: "CT SCAN", icon: "🖥️" },
  { id: "mri", name: "MRI", icon: "🧲" },
  { id: "eps", name: "EPS", icon: "⚡" },
  { id: "opg", name: "OPG", icon: "🦷" },
  { id: "cardiology", name: "CARDIOLOGY", icon: "💓" },
  { id: "eeg", name: "EEG", icon: "🧠" },
  { id: "mammography", name: "MAMMOGRAPHY", icon: "🩺" },
];

const CaseDetailsSection: React.FC<CaseDetailsSectionProps> = ({
  data,
  onChange,
}) => {
  const handleInvestigationClick = (typeId: string) => {
    const exists = data.selectedInvestigations.includes(typeId);
    if (exists) {
      // Remove selection
      const newSel = data.selectedInvestigations.filter((s) => s !== typeId);
      const newPer = { ...data.perInvestigationData };
      delete newPer[typeId];
      onChange({
        selectedInvestigations: newSel,
        perInvestigationData: newPer,
      });
    } else {
      // Add selection and ensure per-investigation entry
      const newSel = [...data.selectedInvestigations, typeId];
      const newPer = { ...data.perInvestigationData };
      if (!newPer[typeId]) {
        newPer[typeId] = {
          investigations: "",
          paid: "0",
          discount: "0",
          sampleCollectedAt: "",
          total: 0,
        };
      }
      onChange({
        selectedInvestigations: newSel,
        perInvestigationData: newPer,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm mr-2">
            2
          </span>
          Case details
        </h3>
      </div>

      <div className="space-y-4">
        {/* Referred By and Collection Centre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <span className="text-red-500">*</span> Referred By
            </label>
            <div className="flex gap-2">
              <Select
                data={[]}
                value={data.referredBy}
                onChange={(value) => onChange({ referredBy: value || "" })}
                placeholder="Select referrer"
                searchable
                className="flex-1"
              />
              <Button
                variant="subtle"
                leftSection={<IconPlus size={16} />}
                className="shrink-0"
              >
                Add New
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <span className="text-red-500">*</span> Collection centre
            </label>
            <Select
              data={[{ value: "main", label: "Main" }]}
              value={data.collectionCentre}
              onChange={(value) => onChange({ collectionCentre: value || "" })}
              placeholder="Select centre"
            />
          </div>
        </div>

        {/* Sample Collection Agent */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            Sample collection agent
          </label>
          <div className="flex gap-2">
            <Select
              data={[]}
              value={data.sampleCollectionAgent}
              onChange={(value) =>
                onChange({ sampleCollectionAgent: value || "" })
              }
              placeholder="Select agent"
              searchable
              className="flex-1"
            />
            <Button
              variant="subtle"
              leftSection={<IconPlus size={16} />}
              className="shrink-0"
            >
              Add new
            </Button>
            <Button variant="subtle" className="shrink-0">
              Edit
            </Button>
          </div>
        </div>

        {/* Payment Details (always visible) */}

        {/* Investigation Types */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-3 block">
            Select Investigation Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {investigationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleInvestigationClick(type.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  data.selectedInvestigations.includes(type.id)
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className="text-2xl mb-2">{type.icon}</span>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {type.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Investigation Forms - One per selected type */}
        {data.selectedInvestigations.map((typeId) => (
          <InvestigationForm
            key={typeId}
            investigationType={typeId}
            data={data.perInvestigationData[typeId]}
            onChange={(d) => {
              const newPer = {
                ...data.perInvestigationData,
                [typeId]: { ...data.perInvestigationData[typeId], ...d },
              };
              onChange({ perInvestigationData: newPer });
            }}
            onClose={() => {
              const newSel = data.selectedInvestigations.filter(
                (s) => s !== typeId
              );
              const newPer = { ...data.perInvestigationData };
              delete newPer[typeId];
              onChange({
                selectedInvestigations: newSel,
                perInvestigationData: newPer,
              });
            }}
          />
        ))}
        <div>
          <PaymentDetailsSection
            data={data.payment}
            onChange={(d) => onChange({ payment: { ...data.payment, ...d } })}
          />
        </div>
      </div>
    </div>
  );
};

// Investigation Form Component
interface InvestigationFormProps {
  investigationType: string;
  data: PerInvestigationData;
  onChange: (d: Partial<PerInvestigationData>) => void;
  onClose: () => void;
}

const InvestigationForm: React.FC<InvestigationFormProps> = ({
  investigationType,
  data,
  onChange,
  onClose,
}) => {
  const formData = data;

  const getInvestigationTitle = () => {
    const type = investigationTypes.find((t) => t.id === investigationType);
    return type ? `${type.name} Investigations` : "Investigations";
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-800">
          {getInvestigationTitle()}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Lab Investigations */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">
            {getInvestigationTitle()}
          </label>
          <Textarea
            value={formData.investigations}
            onChange={(e) =>
              onChange({ investigations: e.currentTarget.value })
            }
            placeholder="Enter investigations..."
            minRows={3}
          />
          <div className="flex gap-2 mt-2">
            <Button size="xs" leftSection={<IconPlus size={14} />}>
              Add New
            </Button>
            <Button size="xs" variant="subtle">
              Ratelist
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Total: Rs. 0 , Due: Rs. 0
          </div>
        </div>

        {/* Paid and Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <span className="text-red-500">*</span> Paid
            </label>
            <TextInput
              value={formData.paid}
              onChange={(e) => onChange({ paid: e.currentTarget.value })}
              type="number"
              min="0"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <span className="text-red-500">*</span> Discount
            </label>
            <TextInput
              value={formData.discount}
              onChange={(e) => onChange({ discount: e.currentTarget.value })}
              type="number"
              min="0"
            />
          </div>
        </div>

        {/* Sample Collected At */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
            <span className="text-red-500">*</span> Sample collected at
          </label>
          <Button
            variant="subtle"
            size="xs"
            onClick={() =>
              onChange({ sampleCollectedAt: new Date().toISOString() })
            }
          >
            Select date & time
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsSection;
