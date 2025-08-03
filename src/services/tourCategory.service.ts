import {
  getTourCategoryBySlug,
  getTourCategories,
  getTourCategoryById,
  createTourCategory,
  updateTourCategory,
  deleteTourCategory,
} from "../apis/tourCategory.api";

export const fetchActiveTourCategories = async () => {
  const response = await getTourCategories();
  if (response.data && response.data.success) {
    return response.data.data.filter((cat: any) => cat.is_active);
  }
  throw new Error("Failed to fetch tour categories");
};

export const getTourCategoriesBySlug = async (slug: string) => {
  const res = await getTourCategoryBySlug(slug);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy tour categories");
};

export const fetchTourCategoryById = async (id: number) => {
  const response = await getTourCategoryById(id);
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error("Failed to fetch tour category");
};

export const createTourCategoryService = async (data: any) => {
  let formData: FormData;

  // If data is already FormData, use it directly
  if (data instanceof FormData) {
    formData = data;
  } else {
    // Create new FormData from object
    formData = new FormData();

    // Add text fields
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.is_active !== undefined)
      formData.append("is_active", data.is_active.toString());

    // Add image file if present
    if (data.image && data.image instanceof File) {
      formData.append("image", data.image);
    }
  }

  const response = await createTourCategory(formData);
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error("Failed to create tour category");
};

export const updateTourCategoryService = async (id: number, data: any) => {
  let formData: FormData;

  // If data is already FormData, use it directly
  if (data instanceof FormData) {
    formData = data;
  } else {
    // Create new FormData from object
    formData = new FormData();

    // Add text fields
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.is_active !== undefined)
      formData.append("is_active", data.is_active.toString());

    // Add image file if present
    if (data.image && data.image instanceof File) {
      formData.append("image", data.image);
    }
  }

  const response = await updateTourCategory(id, formData);
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error("Failed to update tour category");
};

export const deleteTourCategoryService = async (id: number) => {
  const response = await deleteTourCategory(id);
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error("Failed to delete tour category");
};

export const fetchAllTourCategories = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const response = await getTourCategories();
  if (response.data && response.data.success) {
    return {
      data: response.data.data,
      pagination: {
        totalItems: response.data.data.length,
        totalPages: 1,
        currentPage: 1,
        limit: response.data.data.length,
      },
    };
  }
  throw new Error("Failed to fetch tour categories");
};
