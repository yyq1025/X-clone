import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface State {
  parentId?: number | null;
}

interface Actions {
  setParentId: (parentId?: number | null) => void;
}

const initialState: State = {
  parentId: null,
};

export const usePostModalStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      setParentId: (parentId) => set({ parentId }),
    }),
    {
      name: "postModalParentId",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
