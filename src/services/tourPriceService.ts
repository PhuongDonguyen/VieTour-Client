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
    async getTourPricesByTourId(tourId: number) {
        try {
            const response = await import("../api/tourPriceApi").then(m => m.tourPriceApi.getByTourId(tourId));
            return response;
        } catch (error) {
            console.error("Error fetching tour prices by tour_id:", error);
            throw error;
        }
    }
};
