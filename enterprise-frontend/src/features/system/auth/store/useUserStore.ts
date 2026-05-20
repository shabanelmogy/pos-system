import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserRole } from "@/shared/types";

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole | null;
  branchId: string | null;
  posPermissions: any[];
  isAuth: boolean;
  setUser: (userData: Partial<User>) => void;
  removeUser: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      email: null,
      phone: null,
      role: null,
      branchId: null,
      posPermissions: [],
      isAuth: false,

      setUser: (userData) =>
        set({
          ...userData,
          isAuth: true,
        }),

      removeUser: () =>
        set({
          id: null,
          name: null,
          email: null,
          phone: null,
          role: null,
          branchId: null,
          posPermissions: [],
          isAuth: false,
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
