import React, { useState } from "react";
import {
  TextInput,
  Checkbox,
  Button,
  Group,
  ActionIcon,
  Paper,
} from "@mantine/core";
import Notification from "../GlobalNotification/Notification";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

type Address = { addressLine: string; city?: string; pincode?: string };

const OrganizationForm: React.FC = () => {
  const [organizationName, setOrganizationName] = useState("");
  const [centerName, setCenterName] = useState("");
  const [branchType, setBranchType] = useState<{
    diagnosis: boolean;
    clinic: boolean;
  }>({ diagnosis: false, clinic: false });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [primaryContact, setPrimaryContact] = useState("");
  const [secondaryContact, setSecondaryContact] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const navigate = useNavigate();

  const addAddress = () => {
    // allow only one address — if none exists, add one
    setAddresses((s) =>
      s.length === 0 ? [{ addressLine: "", city: "", pincode: "" }] : s
    );
  };
  const removeAddress = (idx: number) =>
    setAddresses((s) => s.filter((_, i) => i !== idx));
  const updateAddress = (idx: number, field: keyof Address, val: string) =>
    setAddresses((s) =>
      s.map((a, i) => (i === idx ? { ...a, [field]: val } : a))
    );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Basic validation
    if (
      !organizationName.trim() ||
      addresses.length === 0 ||
      !primaryContact.trim()
    ) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: "Please fill in all required fields.",
        },
      });
      return;
    }
    // TODO: Call API to submit organization data
    // Example: fetch('/api/create-organization', { method: 'POST', body: JSON.stringify(payload) })
    // If success, navigate to dashboard or home
    const payload = {
      organizationName,
      centerName,
      branchType,
      addresses,
      primaryContact,
      secondaryContact,
      branchEmail,
    };
    console.log("Organization payload:", payload);
    navigate("/success");
  };

  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({ open: false, data: { success: true, message: "" } });

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md ring-1 ring-gray-100"
    >
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Add Your Clinic Or Diagnostic Center
      </h3>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2 text-center">
          Patients will see this information when booking. You can add more
          branches later.
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <TextInput
            placeholder="Enter organization name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.currentTarget.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Center Name</label>
          <TextInput
            placeholder="Enter Center name"
            value={centerName}
            onChange={(e) => setCenterName(e.currentTarget.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Branch Type</label>
          <Group className="my-2">
            <Checkbox
              label="Diagnosis Center"
              checked={branchType.diagnosis}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setBranchType((s) => ({ ...s, diagnosis: checked }));
              }}
            />
            <Checkbox
              label="Clinic"
              checked={branchType.clinic}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setBranchType((s) => ({ ...s, clinic: checked }));
              }}
            />
          </Group>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Address <span className="text-red-500">*</span>
            </label>
            <div>
              <Button
                variant="subtle"
                onClick={addAddress}
                className="flex items-center gap-2"
                disabled={addresses.length >= 1}
              >
                <IconPlus size={14} />
                Add Address
              </Button>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            {addresses.length === 0 ? (
              <div></div>
            ) : (
              addresses.map((addr, i) => (
                <Paper
                  key={i}
                  withBorder
                  radius="md"
                  className="p-3 border-gray-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <TextInput
                        className="flex-1"
                        placeholder={
                          i === 0
                            ? "Enter primary address"
                            : "Enter additional address"
                        }
                        value={addr.addressLine}
                        onChange={(e) =>
                          updateAddress(i, "addressLine", e.currentTarget.value)
                        }
                      />
                      <div className="flex-shrink-0">
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => removeAddress(i)}
                          aria-label="Remove address"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <TextInput
                        placeholder="City"
                        value={addr.city}
                        onChange={(e) =>
                          updateAddress(i, "city", e.currentTarget.value)
                        }
                      />
                      <TextInput
                        placeholder="Pincode"
                        value={addr.pincode}
                        onChange={(e) =>
                          updateAddress(i, "pincode", e.currentTarget.value)
                        }
                      />
                    </div>
                  </div>
                </Paper>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">
            Primary Contact Number <span className="text-red-500">*</span>
          </label>
          <TextInput
            placeholder="Enter primary contact number"
            value={primaryContact}
            onChange={(e) => setPrimaryContact(e.currentTarget.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Secondary Number</label>
          <TextInput
            placeholder="Enter secondary number"
            value={secondaryContact}
            onChange={(e) => setSecondaryContact(e.currentTarget.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Branch Email</label>
          <TextInput
            placeholder="Enter branch email address"
            value={branchEmail}
            onChange={(e) => setBranchEmail(e.currentTarget.value)}
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            type="submit"
            fullWidth
            style={{ backgroundColor: "#2563eb" }}
          >
            Continue - Complete Setup in Dashboard
          </Button>
        </div>
      </div>
    </form>
  );
};

export default OrganizationForm;
