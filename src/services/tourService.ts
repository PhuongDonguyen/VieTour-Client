import {tourApi} from '../api/tourApi';

export const tourService = {
    async getAllTours() {
        try {
            const response = await tourApi.getAll();
            console.log("Fetched tours service:", response);
            return response;
        } catch (error) {
            console.error("Error fetching tours:", error);
            throw error;
        }
    },
    async getTours(page: number, limit: number) {
        try {
            const response = await tourApi.getTours(page, limit);
            console.log("Fetched tours with pagination:", response);
            return response;
        } catch (error) {
            console.error("Error fetching tours with pagination:", error);
            throw error;
        }
    },
    async getToursByIsActive(isActive: boolean) {
        try {
            const response = await tourApi.getByIsActive(isActive);
            console.log("Fetched tours by isActive:", response);
            return response;
        } catch (error) {
            console.error("Error fetching tours by isActive:", error);
            throw error;
        }
    }
};
