// store/organizationStore.js
import { create } from 'zustand';

const useOrganizationStore = create((set, get) => ({
    // state
    organization: {
        id: null,
        name: '',
        address: '',
        phone: '',
        email: '',
    },

    // actions
    setOrganization: (details: any) =>
        set((state: any) => ({
            organization: { ...state.organization, ...details },
        })),

    clearOrganization: () =>
        set(() => ({
            organization: {
                id: null,
                name: '',
                address: '',
                phone: '',
                email: '',
            },
        })),

    updateOrganizationField: (field, value) =>
        set((state) => ({
            organization: { ...state.organization, [field]: value },
        })),
}));

export default useOrganizationStore;
