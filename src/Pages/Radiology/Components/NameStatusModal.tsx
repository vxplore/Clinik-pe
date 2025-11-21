import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, TextInput, Switch } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface Props {
  opened: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; status: string }) => void | Promise<void>;
  initialName?: string;
  initialStatus?: string;
  saving?: boolean;
  title?: string;
}

const NameStatusModal: React.FC<Props> = ({
  opened,
  onClose,
  onSave,
  initialName = "",
  initialStatus = "active",
  saving = false,
  title = "Add",
}) => {
  const [name, setName] = useState(initialName);
  const [active, setActive] = useState(initialStatus === "active");

  useEffect(() => {
    if (opened) {
      setName(initialName);
      setActive(initialStatus === "active");
    }
  }, [opened, initialName, initialStatus]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), status: active ? "active" : "inactive" });
  };

  if (!opened) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <div className="flex gap-4 items-center">
              <TextInput
                label="Name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                autoFocus
                required
                className="flex-1"
              />

              <div className="mt-6">
                <Switch
                  label="Active"
                  checked={active}
                  onChange={(e) => setActive(e.currentTarget.checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button
              variant="subtle"
              onClick={onClose}
              disabled={saving}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              variant="filled"
              color="blue"
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default NameStatusModal;
