import { create } from "zustand";

type SelectedProvider = {
    providerUid: string;
    name?: string;
} | null;

type SelectedProviderState = {
    selectedProvider: SelectedProvider;
    setSelectedProvider: (p: SelectedProvider) => void;
    clearSelectedProvider: () => void;
};

const STORAGE_KEY = "cp_selected_provider";

const loadFromSession = (): SelectedProvider => {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as SelectedProvider;
    } catch {
        return null;
    }
};

const saveToSession = (p: SelectedProvider) => {
    try {
        if (!p) return sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
        // noop
    }
};

const useSelectedProviderStore = create<SelectedProviderState>((set) => ({
    selectedProvider: loadFromSession(),
    setSelectedProvider: (p) => {
        saveToSession(p);
        set({ selectedProvider: p });
    },
    clearSelectedProvider: () => {
        saveToSession(null);
        set({ selectedProvider: null });
    },
}));

export default useSelectedProviderStore;
