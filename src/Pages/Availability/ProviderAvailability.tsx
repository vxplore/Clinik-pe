import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AvailabilityHeader from "./Components/AvailabilityHeader";
import AvailabilityTable from "./Components/AvailabilityTable";
import apis from "../../APis/Api";
import type { DoctorAvailability } from "../../APis/Types";

const ProviderAvailability = () => {
  const navigate = useNavigate();
  const { providerUid } = useParams<{ providerUid: string }>();
  // read providerUid from path parameter
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );

  const [items, setItems] = useState<
    {
      id: number;
      day: string;
      start: string;
      end: string;
      interval: string;
      type: string;
      status: "Active" | "Inactive";
    }[]
  >([]);

  const [doctorName, setDoctorName] = useState<string>("Doctor");
  const [doctorRole, setDoctorRole] = useState<string | undefined>(undefined);
  const [doctorImage, setDoctorImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!providerUid) return;

    let mounted = true;
    const fetch = async () => {
      try {
        const resp = await apis.GetProviderAvailabilities(providerUid);
        // log the doctorProfile explicitly (useful for debugging)
        console.log(
          "API response for availabilities - doctorProfile:",
          resp.data?.doctorProfile
        );
        // response is typed as DoctorAvailabilityResponse
        const availabilities: DoctorAvailability[] =
          resp.data?.availabilities ?? [];
        const doctorProfile = resp.data?.doctorProfile as {
          name?: string;
          specialities?: { name?: string }[];
          profile_pic?: string;
        } | null;
        if (doctorProfile) {
          setDoctorName(doctorProfile.name ?? "Doctor");
          const firstSpec = doctorProfile.specialities?.[0]?.name;
          setDoctorRole(firstSpec);
          setDoctorImage(doctorProfile.profile_pic);
        }
        if (!mounted) return;
        const mapped = availabilities.map((d, idx) => {
          const status: "Active" | "Inactive" =
            d.status && d.status.toLowerCase() === "inactive"
              ? "Inactive"
              : "Active";
          return {
            id: idx + 1,

            day: (d.week_days || []).join(", "),
            start: d.start_time,
            end: d.end_time,
            interval: d.time_slot_interval,
            type: d.appointment_type,
            status,
          };
        });
        setItems(mapped);
      } catch (err) {
        console.error("Error fetching availabilities:", err);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, [providerUid]);

  return (
    <div className="space-y-6 p-0">
      <AvailabilityHeader
        name={doctorName}
        role={doctorRole}
        image={doctorImage}
        onAdd={() => {
          navigate(
            `/availability/add/${encodeURIComponent(String(providerUid))}`
          );
        }}
      />

      <AvailabilityTable
        items={items}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        page={page}
        onPageChange={setPage}
        pageSize={5}
        total={items.length}
      />
    </div>
  );
};

export default ProviderAvailability;
