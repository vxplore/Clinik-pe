import React, { useState } from "react";
import { Modal, Button, Select } from "@mantine/core";
import type { PaymentDetails } from "./PaymentDetailsSection";

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
  payment: PaymentDetails;
  onSave: (p: Partial<PaymentDetails>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  opened,
  onClose,
  payment,
  onSave,
}) => {
  const [discountType, setDiscountType] = useState<"rupee" | "percent">(
    (payment.discountType as "rupee" | "percent") ?? "rupee"
  );

  const handleSave = () => {
    onSave({ discountType });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Settings" centered>
      <div className="space-y-4">
        <Select
          data={[
            { value: "rupee", label: "Rupee" },
            { value: "percent", label: "% (percent)" },
          ]}
          value={discountType}
          onChange={(v) =>
            setDiscountType((v as "rupee" | "percent") || "rupee")
          }
          label="Choose default discount type"
          placeholder="Select discount type"
        />

        {/* No other fields - modal only handles discount type selection */}

        <div className="flex justify-end gap-2">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
