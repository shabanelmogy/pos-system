import { getUserData } from "@/shared/api/services/authApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "@/features/system/auth/store/useUserStore";
import usePOSStore from "@/features/pos/terminal/store/usePOSStore";

const useLoadData = (): boolean => {
  const navigate = useNavigate();
  const { isAuth, setUser, removeUser } = useUserStore();
  const { setActiveShift, setSelectedBranch, setSelectedPOSPoint } = usePOSStore();
  const [isLoading, setIsLoading] = useState<boolean>(!isAuth); // Only load if not authenticated

  useEffect(() => {
    const currentPath = window.location.pathname.replace(/\/$/, ""); 
    
    // If we are already authenticated, we don't need to fetch again during navigation
    if (isAuth) {
      setIsLoading(false);
      return;
    }

    if (currentPath === "/auth") {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await getUserData();
        const { id, name, email, phone, role, branchId, posPermissions } = data.data;
        const serverShift = data.activeShift;

        // 1. Set User
        setUser({ id, name, email, phone, role, branchId, posPermissions });

        // 2. Restore Shift & Terminal if found
        if (serverShift) {
          setActiveShift(serverShift);
          if (serverShift.branch) setSelectedBranch(serverShift.branch);
          if (serverShift.posPoint) setSelectedPOSPoint(serverShift.posPoint);
        }
      } catch (error) {
        removeUser();
        if (window.location.pathname !== "/auth") {
          navigate("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate, isAuth, setUser, removeUser, setActiveShift, setSelectedBranch, setSelectedPOSPoint]);

  return isLoading;
};

export default useLoadData;
