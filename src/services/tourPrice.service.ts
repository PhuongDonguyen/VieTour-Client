import { getTourPrices, getTourPricesByTourId, getAllSortedTourPrices } from "../apis/tourPrice.api";

export const tourPriceService = {
    async getAllTourPrices() {
        try {
            const response = await getTourPrices();
            return response;
        } catch (error) {
            console.error("Error fetching tour prices:", error);
            throw error;
        }
    },
    async getTourPricesByTourId(tourId: number) {
        try {
            const response = await getTourPricesByTourId(tourId);
            return response;
        } catch (error) {
            console.error("Error fetching tour prices by tour_id:", error);
        }
    },

    async getAllSortedTourPrices() {
        try {
            const response = await getAllSortedTourPrices();
            return response;
        } catch (error) {
            throw error;
        }
    }
};
