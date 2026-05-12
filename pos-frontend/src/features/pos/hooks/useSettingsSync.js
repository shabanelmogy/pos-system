import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getPosSettings } from "../../settings/api/settingsApi";
import { setSelectedPOSPoint } from "../store/posSlice";

/**
 * useSettingsSync
 * Periodically fetches the latest POS settings for the active terminal
 * to ensure that Admin changes (like Direct Print or Table Management)
 * take effect on all staff devices without requiring a page refresh.
 */
const useSettingsSync = () => {
    const dispatch = useDispatch();
    const { selectedPOSPoint, activeShift } = useSelector((state) => state.pos);
    const { isAuth } = useSelector((state) => state.user);

    const posPointId = selectedPOSPoint?.id;

    const { data, isSuccess } = useQuery({
        queryKey: ["posSettingsSync", posPointId],
        queryFn: () => getPosSettings(posPointId),
        enabled: !!isAuth && !!posPointId && !!activeShift,
        refetchInterval: 30000, // Sync every 30 seconds
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (isSuccess && data?.data?.data) {
            const remoteSettings = data.data.data;
            
            // Only update if settings have actually changed to avoid unnecessary Redux churn
            const currentSettingsStr = JSON.stringify(selectedPOSPoint.settings);
            const remoteSettingsStr = JSON.stringify(remoteSettings);

            if (currentSettingsStr !== remoteSettingsStr) {
                console.log("[SYNC] POS Settings updated from server.");
                dispatch(setSelectedPOSPoint({
                    ...selectedPOSPoint,
                    settings: remoteSettings
                }));
            }
        }
    }, [isSuccess, data, dispatch, selectedPOSPoint]);
};

export default useSettingsSync;
