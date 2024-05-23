import { create } from "zustand";

interface State {
  loading: boolean;
  userId?: string;
}

interface Actions {
  setLoading: (loading: boolean) => void;
  setUserId: (userId?: string) => void;
}

const initialState: State = {
  loading: true,
  userId: undefined,
};

export const useUserStore = create<State & Actions>((set) => ({
  ...initialState,
  setLoading: (loading) => set({ loading }),
  setUserId: (userId) => set({ userId }),
}));
