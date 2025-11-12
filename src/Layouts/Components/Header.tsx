import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Avatar,
  TextInput,
  ActionIcon,
  Menu,
  UnstyledButton,
  Text,
  Select,
  Modal,
  Button,
  Group,
} from "@mantine/core";
import {
  IconSearch,
  IconBell,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import useAuthStore from "../../GlobalStore/store";
import useDropdownStore from "../../GlobalStore/useDropdownStore";
import apis from "../../APis/Api";
// import useOrgStore from "../../GlobalStore/orgStore";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const organizationDetails = useAuthStore((s) => s.organizationDetails);
  const logout = useAuthStore((s) => s.logout);
  const setSelectedCenter = useDropdownStore((s) => s.setSelectedCenter);

  const name = organizationDetails?.name ?? "";
  const image = organizationDetails?.image ?? undefined;

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const { pathname } = useLocation();

  // ✅ URLs where dropdown should appear
  const pagesWithDropdown = ["/clinic-details", "/providers", "/availability/add"];

  const shouldShowDropdown = pagesWithDropdown.some((p) =>
    pathname.startsWith(p)
  );

  const [orgValue, setOrgValue] = useState<string | null>(null);
  const [centersOptions, setCentersOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isCentersLoading, setIsCentersLoading] = useState(false);

  // get dropdown options
  useEffect(() => {
    if (!shouldShowDropdown) return;

    const orgId = organizationDetails?.organization_id;
    if (!orgId) return;

    const fetchCenters = async () => {
      setIsCentersLoading(true);
      try {
        const response = await apis.getOrganizationCenters(orgId);
        const centers = response?.data?.center || [];

        const options = centers.map((c) => ({ label: c.name, value: c.uid }));
        setCentersOptions(options);

        // No default selection - user must choose explicitly
        // (Removed: set default value from store or first center)

        console.log(
          "Organization centers (api.getOrganizationCenters):",
          response
        );
      } catch (error) {
        console.error("Failed to fetch organization centers:", error);
      } finally {
        setIsCentersLoading(false);
      }
    };

    fetchCenters();
  }, [shouldShowDropdown, organizationDetails?.organization_id]);

  // Logout confirmation modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear Zustand store first
      logout();

      // Call API with isLocalStorageClear: true
      await apis.Logout({ isLocalStorageClear: true });

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsCentersLoading(true);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      {/* Search Input */}
      <div className="flex-1 max-w-lg">
        <TextInput
          placeholder="Search patients, appointments, charts..."
          radius="md"
          size="sm"
          leftSection={
            <div className="pl-2">
              <IconSearch size={16} />
            </div>
          }
          leftSectionWidth={36}
        />
      </div>

      {/* ✅ Dropdown when needed */}

      {/* Notification and Profile */}
      <div className="ml-4 flex items-center gap-4">
        {/* Dropdown */}
        {shouldShowDropdown && (
          <div className="w-60">
            <Select
              classNames={{
                input:
                  "border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-0 focus-visible:outline-none",
              }}
              value={orgValue}
              placeholder="Select Center"
              data={centersOptions}
              searchable
              onChange={(value) => {
                setOrgValue(value);
                // Find the selected center and save to store
                if (value) {
                  const selected = centersOptions.find(
                    (opt) => opt.value === value
                  );
                  if (selected) {
                    setSelectedCenter({
                      center_id: selected.value,
                      center_name: selected.label,
                    });
                  }
                }
              }}
            />
          </div>
        )}

        {/* Bell and profile */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <ActionIcon variant="subtle" color="gray" size={35}>
              <IconBell size={18} />
            </ActionIcon>
            <span className="absolute top-1 -right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </div>

          <Menu withinPortal>
            <Menu.Target>
              <UnstyledButton className="flex items-center gap-3">
                <Avatar src={image} alt={name} radius="xl" size={40}>
                  {!image && initials}
                </Avatar>
                <div className="hidden sm:flex items-center gap-1 text-left">
                  <Text size="sm" fw={600} className="text-gray-700">
                    {name}
                  </Text>
                  <IconChevronDown size={16} className="text-gray-500" />
                </div>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        opened={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        centered
      >
        <Text size="sm" mb="lg">
          Are you sure you want to logout? You will be redirected to the login
          page.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setIsLogoutModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={isLoggingOut}
            onClick={handleConfirmLogout}
          >
            Logout
          </Button>
        </Group>
      </Modal>
    </header>
  );
};

export default Header;
