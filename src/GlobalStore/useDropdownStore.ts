import { create } from "zustand";

type SelectedCenter = {
    center_id: string;
    center_name: string;
} | null;

type DropdownState = {
    selectedCenter: SelectedCenter;
    setSelectedCenter: (center: SelectedCenter) => void;
    clearSelectedCenter: () => void;
};

const useDropdownStore = create<DropdownState>((set) => ({
    selectedCenter: null,
    setSelectedCenter: (center) => set({ selectedCenter: center }),
    clearSelectedCenter: () => set({ selectedCenter: null }),
}));

export default useDropdownStore;
