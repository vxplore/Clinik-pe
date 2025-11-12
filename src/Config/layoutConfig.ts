
export const layoutConfig: Record<
    string,
    { showDropdown: boolean; api?: string }
> = {

    "/clinic-details": { showDropdown: true, api: "/api/clinics" },
    "/centers": { showDropdown: true, api: "/api/clinics" },
    "/providers": { showDropdown: false },
    "/availability": { showDropdown: true },
    "/availability/add": { showDropdown: true },
};
