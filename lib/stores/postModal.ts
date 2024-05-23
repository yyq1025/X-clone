import { create } from "zustand";

interface State {
    parentId: string | null;
}

interface Actions {
    setParentId: (parentId: string | null) => void;
}

const initialState: State = {
    parentId: null,
};

export const usePostModalStore = create<State & Actions>((set) => ({
    ...initialState,
    setParentId: (parentId) => set({ parentId }),
}));
