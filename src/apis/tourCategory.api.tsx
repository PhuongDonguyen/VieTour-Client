import axiosInstance from "./axiosInstance";

export const getTourCategories = () =>
  axiosInstance.get("/api/tour-categories");

export const getTourCategoryBySlug = (slug: string) =>
  axiosInstance.get(`/api/tour-categories?slug=${slug}`);

export const getTourCategoryById = (id: number) =>
  axiosInstance.get(`/api/tour-categories/${id}`);

export const createTourCategory = (data: FormData) =>
  axiosInstance.post("/api/tour-categories", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateTourCategory = (id: number, data: FormData) =>
  axiosInstance.put(`/api/tour-categories/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteTourCategory = (id: number) =>
  axiosInstance.delete(`/api/tour-categories/${id}`);
