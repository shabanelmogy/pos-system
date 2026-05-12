import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
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
