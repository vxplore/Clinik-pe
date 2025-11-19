import React, { useState, useEffect } from "react";
import { Drawer, TextInput, Select, Button, MultiSelect } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";

import type {
  TestPackageRow,
  LabTestItem,
  PanelItem,
} from "../../../APis/Types";

interface Props {
  opened: boolean;
  onClose: () => void;
  row?: TestPackageRow | null;
  onSave: (
    row: TestPackageRow,
    removeTests?: string[],
    removePanels?: string[]
  ) => void;
  loading?: boolean;
}

const EditPackageDrawer: React.FC<Props> = ({
  opened,
  onClose,
  row,
  onSave,
  loading,
}) => {
  const { organizationDetails } = useAuthStore();

  // Form State
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Both">("Both");
  const [tests, setTests] = useState<string[]>([]);
  const [panels, setPanels] = useState<string[]>([]);

  // Track original state for calculating removals
  const [originalTests, setOriginalTests] = useState<string[]>([]);
  const [originalPanels, setOriginalPanels] = useState<string[]>([]);

  // Dynamic Options
  const [availableTests, setAvailableTests] = useState<
    { value: string; label: string }[]
  >([]);
  const [availablePanels, setAvailablePanels] = useState<
    { value: string; label: string }[]
  >([]);

  const [loadingData, setLoadingData] = useState(false);

  // -----------------------------
  // Load Tests + Panels
  // -----------------------------
  useEffect(() => {
    if (
      !opened ||
      !organizationDetails?.organization_id ||
      !organizationDetails?.center_id
    )
      return;

    const loadData = async () => {
      try {
        setLoadingData(true);

        // ----- Fetch Tests -----
        const testsResp = await apis.GetAllTests(
          ["uid", "name"],
          organizationDetails.organization_id as string,
          organizationDetails.center_id as string
        );

        const testsRaw =
          (testsResp?.data as any)?.data ||
          (testsResp?.data as any)?.tests ||
          [];

        if (Array.isArray(testsRaw)) {
          setAvailableTests(
            testsRaw.map((t: LabTestItem) => ({
              value: t.uid,
              label: t.name,
            }))
          );
        }

        // ----- Fetch Panels -----
        const panelsResp = await apis.GetTestPanels(
          1,
          100,
          organizationDetails.organization_id as string,
          organizationDetails.center_id as string,
          ""
        );
        if (panelsResp.success) {
          notifications.show({
            title: "Success",
            message: panelsResp.message,
            color: "green",
          });
        }

        const panelsRaw =
          (panelsResp?.data as any)?.data ||
          (panelsResp?.data as any)?.panels ||
          [];

        if (Array.isArray(panelsRaw)) {
          setAvailablePanels(
            panelsRaw.map((p: PanelItem) => ({
              value: p.panel_id,
              label: (p as any).panel_name || p.name || p.panel_id,
            }))
          );
        }
      } catch (err) {
        console.error("Error loading tests/panels:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load tests and panels",
          color: "red",
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [opened, organizationDetails]);

  // -----------------------------
  // Pre-fill on Edit
  // -----------------------------
  useEffect(() => {
    if (!opened) {
      setName("");
      setFee("");
      setGender("Both");
      setOriginalTests([]);
      setOriginalPanels([]);
      return;
    }

    if (!row) {
      setName("");
      setFee("");
      setGender("Both");
      setTests([]);
      setPanels([]);
      setOriginalTests([]);
      setOriginalPanels([]);
      return;
    }

    setName(row.name || "");
    setFee(String(row.price || row.fee || ""));

    // Normalize gender value
    const g = row.bill_only_for_gender
      ? ((row.bill_only_for_gender.charAt(0).toUpperCase() +
          row.bill_only_for_gender.slice(1)) as "Male" | "Female" | "Both")
      : row.gender;

    setGender(g || "Both");

    // Extract test/panel IDs
    const testIds = Array.isArray(row.tests)
      ? row.tests.map((t) => (typeof t === "string" ? t : t.test_id))
      : [];

    const panelIds = Array.isArray(row.panels)
      ? row.panels.map((p) => (typeof p === "string" ? p : p.panel_id))
      : [];

    setTests(testIds);
    setPanels(panelIds);

    // Store original state for calculating removals
    setOriginalTests(testIds);
    setOriginalPanels(panelIds);
  }, [row, opened]);

  // -----------------------------
  // Save Handler
  // -----------------------------
  const handleSave = () => {
    if (!name.trim()) return;

    // Calculate which tests and panels were removed
    const removeTests = originalTests.filter((t) => !tests.includes(t));
    const removePanels = originalPanels.filter((p) => !panels.includes(p));

    const updated: TestPackageRow = {
      uid: row?.uid || row?.id || String(Date.now()),
      id: row?.id,
      name: name.trim(),
      price: Number(fee) || 0,
      fee: fee.trim(),
      bill_only_for_gender: gender.toLowerCase() as "male" | "female" | "both",
      gender,

      tests: tests.length
        ? tests.map((t) => ({
            test_id: t,
          }))
        : undefined,

      panels: panels.length
        ? panels.map((p) => ({
            panel_id: p,
          }))
        : undefined,
    };

    onSave(updated, removeTests, removePanels);
    onClose();
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={row ? "Edit test package" : "Add test package"}
    >
      <div className="flex flex-col gap-4">
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />

        <TextInput
          label="Fee"
          value={fee}
          onChange={(e) => setFee(e.currentTarget.value)}
        />

        <Select
          label="Bill only for gender"
          value={gender}
          onChange={(v) =>
            setGender((v as "Male" | "Female" | "Both") || "Both")
          }
          data={[
            { value: "Both", label: "Both" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />

        <MultiSelect
          label="Tests"
          placeholder="Select tests"
          data={availableTests}
          value={tests}
          onChange={setTests}
          searchable
          clearable
          disabled={loadingData}
        />

        <MultiSelect
          label="Panels"
          placeholder="Select panels"
          data={availablePanels}
          value={panels}
          onChange={setPanels}
          searchable
          clearable
          disabled={loadingData}
        />

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            variant="filled"
            color="blue"
            loading={loading}
          >
            Save
          </Button>
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default EditPackageDrawer;
