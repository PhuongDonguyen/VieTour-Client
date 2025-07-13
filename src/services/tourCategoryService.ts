import { tourCategoryAPI } from "../apis/tourCategoryApi";

export const tourCategoryService = {
    async getAllTourCategories() {
        try {
            const response = await tourCategoryAPI.getAll();
            console.log("Fetched tour categories service:", response);
            return response;
        } catch (error) {
            console.error("Error fetching tour categories:", error);
            throw error;
        }
    },

    async getTourCategoryBySlug(slug:string) {
        try {
            const response = await tourCategoryAPI.getBySlug(slug);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
