"use client"
import RegionDropdown from "@/components/RegionDropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegionSelection() {
    const handleOnSelectRegion = async () => {
        try {
            const regionStr = await AsyncStorage.getItem("region");
            if (!regionStr) {
                console.warn("No region in storage. Attempting to refetch location...");
                return;
            }
            const region = JSON.parse(regionStr);
            console.log("Region selected (via failsafe):", region);
        } catch (error) {
            console.error("Error in OnSelectRegion fallback:", error);
        }
        };
    return(
        <RegionDropdown />
    );
}