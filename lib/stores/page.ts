import { create } from "zustand";

interface State {
    currentPage: "home" | "notifications" | "bookmarks" | "profile" | "status";
}

interface Actions {
    setCurrentPage: (curPage: State["currentPage"]) => void;
}

const initialState: State = {
    currentPage: "home",
};

export const usePageStore = create<State & Actions>((set) => ({
    ...initialState,
    setCurrentPage: (currentPage) => set({ currentPage }),
}));
