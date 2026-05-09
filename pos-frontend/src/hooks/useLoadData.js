import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

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
        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
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
