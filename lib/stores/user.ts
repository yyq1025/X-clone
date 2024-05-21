import { create } from "zustand";

interface State {
  loading: boolean;
  userId: string;
}

interface Actions {
  setLoading: (loading: boolean) => void;
  setUserId: (uid: string) => void;
}

const initialState: State = {
  loading: true,
  userId: "",
};

export const useUserStore = create<State & Actions>((set) => ({
  ...initialState,
  setLoading: (loading) => set({ loading }),
  setUserId: (uid) => set({ userId: uid }),
}));
