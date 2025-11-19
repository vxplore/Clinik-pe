import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Button, Select } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testId: string, testName: string, interpretation: string) => void;
  testOptions: { value: string; label: string }[];
  editingData?: {
    id: string;
    test_id: string;
    test_name: string;
    interpretation: string;
  } | null;
  loading?: boolean;
  kind?: "tests" | "panels";
}

const PortalModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  testOptions,
  editingData,
  loading = false,
  kind = "tests",
}) => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [selectedTestName, setSelectedTestName] = useState<string>("");
  const [interpretation, setInterpretation] = useState<string>("");

  useEffect(() => {
    if (editingData) {
      setSelectedTest(editingData.test_id);
      setSelectedTestName(editingData.test_name);
      setInterpretation(editingData.interpretation);
    } else {
      setSelectedTest(null);
      setSelectedTestName("");
      setInterpretation("");
    }
  }, [editingData, isOpen]);

  const handleSave = () => {
    const chosenId = selectedTest ?? editingData?.test_id;
    const chosenName = selectedTestName ?? editingData?.test_name;
    if (!chosenId || !interpretation.trim()) {
      alert("Please select a test/panel and enter interpretation");
      return;
    }
    onSave(chosenId, chosenName ?? "", interpretation);
  };

  const handleClose = () => {
    setSelectedTest(null);
    setSelectedTestName("");
    setInterpretation("");
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between sticky top-0 bg-white border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingData
              ? `Edit ${kind === "panels" ? "Panel" : "Test"} Interpretation`
              : `Add ${kind === "panels" ? "Panel" : "Test"} Interpretation`}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close modal"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Test / Panel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test / Panel Name
            </label>
            {editingData &&
            selectedTest &&
            !testOptions.some((opt) => opt.value === selectedTest) ? (
              <div className="p-2 bg-gray-50 border rounded text-sm">
                {selectedTestName}
              </div>
            ) : (
              <Select
                placeholder="Select a test/panel"
                data={testOptions}
                value={selectedTest}
                onChange={(val) => {
                  setSelectedTest(val);
                  const selected = testOptions.find((opt) => opt.value === val);
                  setSelectedTestName(selected?.label || "");
                }}
                searchable
                clearable
                disabled={editingData !== null}
                classNames={{
                  input:
                    "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  dropdown:
                    "border rounded-md shadow-md max-h-60 overflow-y-auto",
                }}
              />
            )}
          </div>

          {/* Interpretation Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interpretation
            </label>
            <textarea
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              placeholder="Enter interpretation details..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {/* <p className="text-xs text-gray-500 mt-1">
              You can also copy interpretations from the Library to update this.
            </p> */}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-end gap-3">
          <Button variant="default" onClick={handleClose} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            variant="filled"
            color="blue"
            onClick={handleSave}
            loading={loading}
            className="px-6 py-2"
          >
            {editingData ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PortalModal;
