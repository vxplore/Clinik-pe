import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { Tabs } from "@mantine/core";
import InterpretationTable, {
  type InterpretationRow,
} from "./Components/InterpretationTable";
import AddInterpretationModal from "./Components/AddInterpretationModal";
import apis from "../../APis/Api";
import type { LabTestsListResponse } from "../../APis/Types";
import useAuthStore from "../../GlobalStore/store";

interface TestItem {
  uid: string;
  name?: string;
  test_name?: string;
  interpretation?: string;
}

interface PanelItem {
  uid: string;
  panel_id?: string;
  panel_name?: string;
  name?: string;
  interpretation?: string;
}

interface InterpretationAPIResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  data: {
    tests?: TestItem[];
    panels?: PanelItem[];
  };
}

const InterpretationPage = () => {
  const { organizationDetails } = useAuthStore();

  const [activeTab, setActiveTab] = useState<string | null>("tests");

  // Tests Tab State
  const [testsData, setTestsData] = useState<InterpretationRow[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsPage, setTestsPage] = useState(1);
  const [testsPageSize] = useState(10);
  const [testOptions, setTestOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Panels Tab State
  const [panelsData, setPanelsData] = useState<InterpretationRow[]>([]);
  const [panelsLoading, setPanelsLoading] = useState(false);
  const [panelsPage, setPanelsPage] = useState(1);
  const [panelsPageSize] = useState(10);
  const [panelOptions, setPanelOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<InterpretationRow | null>(
    null
  );
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch Tests Interpretations
  const fetchTestsInterpretations = async () => {
    if (
      !organizationDetails?.organization_id ||
      !organizationDetails?.center_id
    )
      return;

    setTestsLoading(true);
    try {
      const resp = (await apis.GetTestInterpretations(
        organizationDetails.organization_id,
        organizationDetails.center_id
      )) as InterpretationAPIResponse;

      const tests = resp?.data?.tests || [];
      setTestsData(
        tests.map((t: TestItem) => ({
          id: t.uid,
          uid: t.uid,
          test_name: t.name || t.test_name || "",
          test_id: t.uid,
          interpretation: t.interpretation || "",
        }))
      );
      // Also populate test options for select dropdown
      try {
        const respAllTests = (await apis.GetAllTests(
          ["uid", "name"],
          organizationDetails.organization_id,
          organizationDetails.center_id
        )) as LabTestsListResponse;
        const testsAllRaw = respAllTests?.data?.data || [];
        const testsAll: TestItem[] = Array.isArray(testsAllRaw)
          ? testsAllRaw.map((t: { uid: string; name: string }) => ({
              uid: t.uid,
              name: t.name,
            }))
          : [];
        setTestOptions(
          testsAll.map((t) => ({
            value: t.uid,
            label: t.name || t.test_name || "",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch test options:", err);
      }
    } catch (err) {
      console.error("Failed to fetch test interpretations:", err);
      notifications.show({
        title: "Error",
        message: "Failed to load test interpretations",
        color: "red",
      });
    } finally {
      setTestsLoading(false);
    }
  };

  // Fetch Panels Interpretations
  const fetchPanelsInterpretations = async () => {
    if (
      !organizationDetails?.organization_id ||
      !organizationDetails?.center_id
    )
      return;

    setPanelsLoading(true);
    try {
      const resp = (await apis.GetPanelInterpretations(
        organizationDetails.organization_id,
        organizationDetails.center_id
      )) as InterpretationAPIResponse;

      const panels = resp?.data?.panels || [];
      setPanelsData(
        panels.map((p: PanelItem) => ({
          id: p.uid || p.panel_id || "",
          uid: p.uid || p.panel_id || "",
          test_name: p.panel_name || p.name || "",
          test_id: p.uid || p.panel_id || "",
          interpretation: p.interpretation || "",
        }))
      );
      // Also populate panel options for modal select
      setPanelOptions(
        panels.map((p: PanelItem) => ({
          value: p.uid || p.panel_id || "",
          label: p.panel_name || p.name || "",
        }))
      );
    } catch (err) {
      console.error("Failed to fetch panel interpretations:", err);
      notifications.show({
        title: "Error",
        message: "Failed to load panel interpretations",
        color: "red",
      });
    } finally {
      setPanelsLoading(false);
    }
  };

  // Load data on mount and tab change
  useEffect(() => {
    if (activeTab === "tests") {
      fetchTestsInterpretations();
    } else if (activeTab === "panels") {
      fetchPanelsInterpretations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, organizationDetails]);

  // Handle Edit
  const handleEdit = (row: InterpretationRow) => {
    setEditingData(row);
    setModalOpen(true);
  };

  // Handle Save (Update only)
  const handleSaveInterpretation = async (
    _testId: string,
    _testName: string,
    interpretation: string
  ) => {
    if (!editingData) return;
    if (
      !organizationDetails?.organization_id ||
      !organizationDetails?.center_id
    )
      return;

    setModalLoading(true);
    try {
      if (activeTab === "tests") {
        await apis.UpdateTestInterpretations(
          organizationDetails.organization_id,
          organizationDetails.center_id,
          editingData.uid,
          interpretation
        );

        setTestsData((prev) =>
          prev.map((item) =>
            item.id === editingData.id ? { ...item, interpretation } : item
          )
        );
      } else if (activeTab === "panels") {
        await apis.UpdatePanelInterpretations(
          organizationDetails.organization_id,
          organizationDetails.center_id,
          editingData.uid,
          interpretation
        );

        setPanelsData((prev) =>
          prev.map((item) =>
            item.id === editingData.id ? { ...item, interpretation } : item
          )
        );
      }

      notifications.show({
        title: "Success",
        message: "Interpretation updated successfully",
        color: "green",
      });

      setModalOpen(false);
      setEditingData(null);
    } catch (err) {
      console.error("Failed to update interpretation:", err);
      notifications.show({
        title: "Error",
        message: "Failed to update interpretation",
        color: "red",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const currentData = activeTab === "tests" ? testsData : panelsData;
  const currentLoading = activeTab === "tests" ? testsLoading : panelsLoading;
  const currentPage = activeTab === "tests" ? testsPage : panelsPage;
  const currentPageSize =
    activeTab === "tests" ? testsPageSize : panelsPageSize;
  const setCurrentPage = activeTab === "tests" ? setTestsPage : setPanelsPage;

  const paginatedData = currentData.slice(
    (currentPage - 1) * currentPageSize,
    currentPage * currentPageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-100">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow className="px-2 pt-2 border-b border-gray-200">
            <Tabs.Tab value="tests" className="text-base">
              Tests
            </Tabs.Tab>
            <Tabs.Tab value="panels" className="text-base">
              Panels
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="tests" className="p-2">
            <InterpretationTable
              data={paginatedData}
              page={currentPage}
              pageSize={currentPageSize}
              total={currentData.length}
              loading={currentLoading}
              onPageChange={setCurrentPage}
              onEdit={handleEdit}
              onDelete={() => {}}
              hideAddButton
              hideDeleteButton
              title="Test Interpretations"
            />
          </Tabs.Panel>

          <Tabs.Panel value="panels" className="p-0">
            <InterpretationTable
              data={paginatedData}
              page={currentPage}
              pageSize={currentPageSize}
              total={currentData.length}
              loading={currentLoading}
              onPageChange={setCurrentPage}
              onEdit={handleEdit}
              onDelete={() => {}}
              hideAddButton
              hideDeleteButton
              title="Panel Interpretations"
            />
          </Tabs.Panel>
        </Tabs>
      </div>

      <AddInterpretationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingData(null);
        }}
        onSave={handleSaveInterpretation}
        testOptions={activeTab === "tests" ? testOptions : panelOptions}
        kind={activeTab === "tests" ? "tests" : "panels"}
        editingData={editingData}
        loading={modalLoading}
      />
    </div>
  );
};

export default InterpretationPage;
