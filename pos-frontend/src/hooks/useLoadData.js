import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { setActiveShift, setSelectedBranch, setSelectedPOSPoint } from "../redux/slices/posSlice";

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuth } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(!isAuth); // Only load if not authenticated

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
        dispatch(setUser({ id, name, email, phone, role, branchId, posPermissions }));

        // 2. Restore Shift & Terminal if found
        if (serverShift) {
          dispatch(setActiveShift(serverShift));
          if (serverShift.branch) dispatch(setSelectedBranch(serverShift.branch));
          if (serverShift.posPoint) dispatch(setSelectedPOSPoint(serverShift.posPoint));
        }
      } catch (error) {
        dispatch(removeUser());
        if (window.location.pathname !== "/auth") {
          navigate("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, navigate, isAuth]);

  return isLoading;
};

export default useLoadData;
