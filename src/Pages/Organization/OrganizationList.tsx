import React, { useEffect, useState, useRef } from "react";
import StatCard from "./Components/StatCard";
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";
import OrganizationTable from "./Components/OrganizationTable";
import apis from "../../APis/Api";
import type { Organization } from "../../APis/Types";

// Move configuration outside component to prevent re-creation
const CONFIGURATION = "need_stats_overall,need_stats_per_organization";

const OrganizationList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [country, setCountry] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  type OrganizationStatsType = {
    total?: number;
    active?: number;
    inactive?: number;
    growth?: {
      total?: { percentage?: number };
      active?: { percentage?: number };
      inactive?: { percentage?: number };
    };
  };

  const [orgStats, setOrgStats] = useState<OrganizationStatsType | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (fetchingRef.current) return;

    const fetchPage = async () => {
      fetchingRef.current = true;

      try {
        const resp = await apis.GetOrganizationsList({
          pageNumber: page,
          pageSize,
          configuration: CONFIGURATION,
          ...(country && { country }),
          ...(status && { status }),
        });

        console.log("API Response:", resp);

        const orgData = resp.data?.organization ?? [];
        console.log("Organization data from API:", orgData);

        setOrganizations(orgData);

        // Extract stats if available
        const dataExt = resp.data as unknown as {
          organization_stats?: OrganizationStatsType;
        };

        setOrgStats(dataExt.organization_stats ?? null);

        // Set total from pagination or fallback to data length
        setTotal(resp.data?.pagination?.totalRecords ?? orgData.length ?? 0);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setOrganizations([]);
        setTotal(0);
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchPage();
  }, [page, pageSize, country, status]);

  const getDeltaData = (
    stats: typeof orgStats | null,
    key: "total" | "active" | "inactive"
  ) => {
    const pct = stats?.growth?.[key]?.percentage ?? 0;
    const deltaType = pct >= 0 ? "positive" : "negative";
    const DeltaIcon =
      pct >= 0 ? (
        <IconArrowUp className="text-green-600" />
      ) : (
        <IconArrowDown className="text-red-500" />
      );

    return { pct: `${Math.abs(pct)}%`, deltaType, DeltaIcon };
  };

  return (
    <div className="space-y-6 p-0">
      <div className="flex gap-4">
        <StatCard
          title="Total Organizations"
          value={orgStats?.total ?? total}
          delta={getDeltaData(orgStats, "total").pct}
          deltaType={
            getDeltaData(orgStats, "total").deltaType as "positive" | "negative"
          }
          icon={getDeltaData(orgStats, "total").DeltaIcon}
        />

        <StatCard
          title="Active Organizations"
          value={orgStats?.active ?? 0}
          delta={getDeltaData(orgStats, "active").pct}
          deltaType={
            getDeltaData(orgStats, "active").deltaType as
              | "positive"
              | "negative"
          }
          icon={getDeltaData(orgStats, "active").DeltaIcon}
        />

        <StatCard
          title="Inactive Organizations"
          value={orgStats?.inactive ?? 0}
          delta={getDeltaData(orgStats, "inactive").pct}
          deltaType={
            getDeltaData(orgStats, "inactive").deltaType as
              | "positive"
              | "negative"
          }
          icon={getDeltaData(orgStats, "inactive").DeltaIcon}
        />
      </div>

      <OrganizationTable
        orgData={organizations}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onCountryChange={setCountry}
        onStatusChange={setStatus}
        selectedCountry={country}
        selectedStatus={status}
      />
    </div>
  );
};

export default OrganizationList;
