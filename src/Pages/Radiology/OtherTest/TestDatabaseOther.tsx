import React, { useEffect, useMemo, useState } from "react";
import FilterBar from "../../TestDatabase/Components/FilterBar";
import TestTable from "../../TestDatabase/Components/TestTable";
import type { TestRow } from "../../TestDatabase/Components/TestTable";
import apis from "../../../APis/Api";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../../GlobalStore/store";
import { useNavigate } from "react-router-dom";
import type { LabTest } from "../../../APis/Types";

const TestDatabaseOther: React.FC = () => {
  const [categories, setCategories] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [tests, setTests] = useState<TestRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apis.GetTestCategories(
          organizationId,
          centerId,
          undefined,
          1,
          100
        );
        if (mounted && resp?.success && resp?.data?.categorys) {
          const catList = resp.data.categorys.map((c) => ({
            id: c.uid,
            name: c.name,
          }));
          setCategories(catList);
        }
      } catch (err) {
        console.warn("GetTestCategories failed:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load test categories",
          color: "red",
        });
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [organizationId, centerId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apis.GetAllTestsList(
          query,
          page,
          pageSize,
          organizationId,
          centerId
        );
        console.log("GetAllTestsList response (radiology):", resp);
        // @ts-expect-error: allow data form this API response
        if (mounted && resp.data.tests && Array.isArray(resp.data.tests)) {
          // @ts-expect-error: allow data form this API response
          const testRows: TestRow[] = (resp.data.tests as LabTest[]).map(
            (test) => ({
              id: test.uid,
              order: Number(test.order) || 0,
              name: test.name,
              shortName: test.short_name,
              category: test.category_id,
            })
          );
          setTests(testRows);
        }
      } catch (err) {
        console.warn("GetAllTestsList failed:", err);
        notifications.show({
          title: "Error",
          message: "Failed to load tests",
          color: "red",
        });
        setTests([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [organizationId, centerId, query, page, pageSize]);

  const filtered = useMemo(() => {
    let data = tests;
    if (category) data = data.filter((t) => t.category === category);
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.shortName || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [tests, category, query]);

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleEdit = (row: TestRow) => {
    console.log("edit radiology", row);
  };

  const handleView = (row: TestRow) => {
    console.log("view radiology", row);
  };

  const navigate = useNavigate();

  const handleAdd = () => {
    // navigate to radiology add page
    navigate("/radiology/test-database/add");
  };

  // We no longer use the AddTestTypeModal for radiology; direct navigation is used.

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Radiology Test database
          </h2>
        </div>
        <FilterBar
          categories={categories}
          selectedCategory={category}
          onCategoryChange={(val) => {
            setCategory(val || null);
            setPage(1);
          }}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            setPage(1);
          }}
          onAddNew={handleAdd}
          disabled={loading}
        />

        {/* Using direct Add Page instead of modal for Radiology */}
      </div>

      <TestTable
        records={rows}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        total={total}
        onEdit={handleEdit}
        onView={handleView}
      />
    </div>
  );
};

export default TestDatabaseOther;
