import { tourPriceApi } from "../api/tourPriceApi";

export const tourPriceService = {
    async getAllTourPrices() {
        try {
            const response = await tourPriceApi.getAll();
            console.log("Fetched tour prices service:", response);
            return response;
        } catch (error) {
            console.error("Error fetching tour prices:", error);
            throw error;
        }
    },

    async getAllSortedTourPrices() {
        try {
            const response = await tourPriceApi.getAllSorted();
            return response;
        } catch (error) {
            throw error;
        }
    }

};
