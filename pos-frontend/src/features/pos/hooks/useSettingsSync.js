import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosSettings } from "../../settings/api/settingsApi";
import usePOSStore from "../store/usePOSStore";
import useUserStore from "../../auth/store/useUserStore";

/**
 * useSettingsSync
 * Periodically fetches the latest POS settings for the active terminal
 * to ensure that Admin changes (like Direct Print or Table Management)
 * take effect on all staff devices without requiring a page refresh.
 */
const useSettingsSync = () => {
    const { selectedPOSPoint, activeShift, setSelectedPOSPoint } = usePOSStore();
    const { isAuth } = useUserStore();

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
            
            // Only update if settings have actually changed to avoid unnecessary Zustand churn
            const currentSettingsStr = JSON.stringify(selectedPOSPoint.settings);
            const remoteSettingsStr = JSON.stringify(remoteSettings);

            if (currentSettingsStr !== remoteSettingsStr) {
                console.log("[SYNC] POS Settings updated from server.");
                setSelectedPOSPoint({
                    ...selectedPOSPoint,
                    settings: remoteSettings
                });
            }
        }
    }, [isSuccess, data, selectedPOSPoint, setSelectedPOSPoint]);
};

export default useSettingsSync;
