import { useDispatch } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentPath = window.location.pathname.replace(/\/$/, ""); // Remove trailing slash
    console.log("[useLoadData] Current Path:", currentPath);

    if (currentPath === "/auth") {
      console.log("[useLoadData] On auth page, skipping fetch");
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      console.log("[useLoadData] Fetching user data...");
      try {
        const { data } = await getUserData();
        console.log("[useLoadData] User data received:", data);
        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
      } catch (error) {
        console.error("[useLoadData] Fetch error:", error);
        dispatch(removeUser());
        // Only navigate if we aren't already heading to auth via interceptor
        if (window.location.pathname !== "/auth") {
          navigate("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, navigate]);

  return isLoading;
};

export default useLoadData;
