import { useEffect, useState, useRef } from "react";
import StatCard from "../Organization/Components/StatCard";
import { IconCheck, IconX } from "@tabler/icons-react";
import ClinicTable from "./Components/ClinicTable";
import apis from "../../APis/Api";
import type { Center } from "../../APis/Types";
import useAuthStore from "../../GlobalStore/store";

const ClinicList = () => {
  const CONFIGURATION = "need_stats_overall,need_stats_per_organization";
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [centers, setCenters] = useState<Center[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  // Extract organization_id from auth store
  const organizationDetails = useAuthStore(
    (state) => state.organizationDetails
  );
  console.log("Organization Details from Store:", organizationDetails);
  const organizationId = organizationDetails?.organization_id
    ? String(organizationDetails.organization_id)
    : undefined;

  console.log("Organization ID:", organizationId);

  type CenterStatsType = {
    total?: number;
    active?: number;
    inactive?: number;
    growth?: {
      total?: { percentage?: number };
      active?: { percentage?: number };
      inactive?: { percentage?: number };
    };
  };

  const [centerStats, setCenterStats] = useState<CenterStatsType | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (fetchingRef.current) return;

    const fetchCenters = async () => {
      fetchingRef.current = true;

      try {
        const resp = await apis.GetClinicsList(organizationId, {
          pageNumber: page,
          pageSize,
          configuration: CONFIGURATION,
          type: typeFilter,
          status: statusFilter?.toLowerCase(),
        });

        console.log("Clinics API Response:", resp);

        const centerData = resp.data?.center ?? [];
        console.log("Centers data from API:", centerData);

        setCenters(centerData);

        // Extract stats if available
        const dataExt = resp.data as unknown as {
          center_stats?: CenterStatsType;
        };

        setCenterStats(dataExt.center_stats ?? null);

        // Set total from pagination or fallback to data length
        setTotal(resp.data?.pagination?.totalRecords ?? centerData.length ?? 0);
      } catch (err) {
        console.error("Error fetching centers:", err);
        setCenters([]);
        setTotal(0);
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchCenters();
  }, [page, pageSize, typeFilter, statusFilter, organizationId]);

  const getDeltaData = (
    stats: typeof centerStats | null,
    key: "total" | "active" | "inactive"
  ) => {
    const pct = stats?.growth?.[key]?.percentage ?? 0;
    const deltaType = pct >= 0 ? "positive" : "negative";
    const DeltaIcon =
      pct >= 0 ? (
        <IconCheck className="text-green-600" />
      ) : (
        <IconX className="text-red-500" />
      );

    return { pct: `${Math.abs(pct)}%`, deltaType, DeltaIcon };
  };

  return (
    <div className="  space-y-6 p-0">
      <div className="flex gap-4">
        <StatCard
          title="Total Clinics"
          value={centerStats?.total ?? total}
          delta={getDeltaData(centerStats, "total").pct}
          deltaType={
            getDeltaData(centerStats, "total").deltaType as
              | "positive"
              | "negative"
          }
          icon={getDeltaData(centerStats, "total").DeltaIcon}
        />

        <StatCard
          title="Active Clinics"
          value={centerStats?.active ?? 0}
          delta={getDeltaData(centerStats, "active").pct}
          deltaType={
            getDeltaData(centerStats, "active").deltaType as
              | "positive"
              | "negative"
          }
          icon={getDeltaData(centerStats, "active").DeltaIcon}
        />

        <StatCard
          title="Inactive Clinics"
          value={centerStats?.inactive ?? 0}
          delta={getDeltaData(centerStats, "inactive").pct}
          deltaType={
            getDeltaData(centerStats, "inactive").deltaType as
              | "positive"
              | "negative"
          }
          icon={getDeltaData(centerStats, "inactive").DeltaIcon}
        />
      </div>

      <ClinicTable
        centerData={centers}
        total={total}
        page={page}
        pageSize={10}
        onPageChange={(p: number) => setPage(p)}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        selectedType={typeFilter}
        selectedStatus={statusFilter}
        organizationId={organizationId}
      />
    </div>
  );
};

export default ClinicList;
