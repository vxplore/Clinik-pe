import { create } from "zustand";

type SelectedCenter = {
    center_id: string;
    center_name: string;
} | null;

type DropdownState = {
    selectedCenter: SelectedCenter;
    setSelectedCenter: (center: SelectedCenter) => void;
    clearSelectedCenter: () => void;
    // A simple counter to let components subscribe to 'centers changed' events.
    centersRefreshCounter: number;
    bumpCentersRefresh: () => void;
};

const useDropdownStore = create<DropdownState>((set) => ({
    selectedCenter: null,
    setSelectedCenter: (center) => set({ selectedCenter: center }),
    clearSelectedCenter: () => set({ selectedCenter: null }),
    centersRefreshCounter: 0,
    bumpCentersRefresh: () => set((state) => ({ centersRefreshCounter: state.centersRefreshCounter + 1 })),
}));

export default useDropdownStore;
