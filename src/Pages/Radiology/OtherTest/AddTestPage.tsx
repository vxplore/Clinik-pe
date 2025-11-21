import React, { useEffect, useState } from "react";
import {
  Paper,
  TextInput,
  Textarea,
  Button,
  Text,
  Select,
  Switch,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../../GlobalStore/store";
import apis from "../../../APis/Api";
import { IconArrowLeft } from "@tabler/icons-react";
import { Anchor } from "@mantine/core";

const AddTestPage: React.FC = () => {
  const navigate = useNavigate();
  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState(true);
  const [data, setData] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apis.GetTestCategories(
          organizationId,
          centerId,
          undefined,
          1,
          100
        );
        if (mounted && resp?.success && resp?.data?.categorys) {
          setCategories(
            resp.data.categorys.map((c: any) => ({ id: c.uid, name: c.name }))
          );
        }
      } catch (err) {
        console.warn("Failed to load categories", err);
      }
    })();

    // Mock departments for now — replace with API later if available
    setDepartments([
      { id: "radiology", name: "Radiology" },
      { id: "pathology", name: "Pathology" },
      { id: "microbiology", name: "Microbiology" },
    ]);

    return () => {
      mounted = false;
    };
  }, [organizationId, centerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notifications.show({
        title: "Error",
        message: "Name is required",
        color: "red",
      });
      return;
    }
    if (!category) {
      notifications.show({
        title: "Error",
        message: "Category is required",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      // Build create payload (minimal to satisfy API)
      const payload = {
        type: "single",
        name: name.trim(),
        short_name: name.trim().slice(0, 10),
        category_id: category,
        unit_id: undefined,
        input_type: "numeric",
        default_result: "",
        optional: false,
        price: price || "0",
        method: "",
        instrument: "",
        interpretation: description || "",
        notes: "",
        comments: "",
      } as any;

      const response = await apis.AddTestToLabDatabase(
        organizationId || "",
        centerId || "",
        payload
      );
      console.log("AddTestToLabDatabase response:", response);

      if (response?.success) {
        notifications.show({
          title: "Success",
          message: response.message || "Test added",
          color: "green",
        });
        setTimeout(() => navigate("/radiology/test-database"), 800);
      } else {
        notifications.show({
          title: "Error",
          message: response?.message || "Failed to add test",
          color: "red",
        });
      }
    } catch (err) {
      console.error("AddTestToLabDatabase failed:", err);
      notifications.show({
        title: "Error",
        message: "Failed to add test",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-0">
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 text-blue-600 text-sm hover:bg-blue-50 rounded-md"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600}>
            Back to Radiology Tests
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Add Radiology Test
        </h2>
        <p className="text-sm text-gray-600">
          Enter details for a new radiology test
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <TextInput
                label="Name"
                placeholder="Test name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
              />
            </div>
            <div>
              <TextInput
                label="Price"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.currentTarget.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <Textarea
              label="Description"
              placeholder="Test description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Select
                label="Department"
                placeholder="Select department"
                data={departments.map((d) => ({ value: d.id, label: d.name }))}
                value={department}
                onChange={(v) => setDepartment(v)}
              />
            </div>
            <div>
              <Select
                label="Category"
                placeholder="Select category"
                data={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={category}
                onChange={(v) => setCategory(v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <TextInput
                label="Data"
                placeholder="Additional data"
                value={data}
                onChange={(e) => setData(e.currentTarget.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                label="Active"
                checked={status}
                onChange={(e) => setStatus(e.currentTarget.checked)}
              />
            </div>
          </div>

          <div className="flex justify-start">
            <Button
              type="submit"
              variant="filled"
              color="blue"
              loading={loading}
            >
              Create Test
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default AddTestPage;
