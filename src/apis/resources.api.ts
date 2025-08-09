import axiosInstance from "./axiosInstance";

export interface ResourceItem {
  id: number;
  key: string;
  content: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResourcesResponse {
  success: boolean;
  data: ResourceItem[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ResourceResponse {
  success: boolean;
  data: ResourceItem;
}

// Get all resources
export const getResources = (): Promise<ResourcesResponse> =>
  axiosInstance.get("/api/resources").then((response) => response.data);

// Get resource by key using query parameter
export const getResourceByKey = (key: string): Promise<ResourceResponse> =>
  axiosInstance
    .get(`/api/resources?key=${encodeURIComponent(key)}`)
    .then((response) => response.data);

// Get resource by ID
export const getResourceById = (id: number): Promise<ResourceResponse> =>
  axiosInstance.get(`/api/resources/${id}`).then((response) => response.data);

// Get multiple resources by keys
export const getResourcesByKeys = (
  keys: string[]
): Promise<ResourcesResponse> => {
  const queryParams = new URLSearchParams();
  keys.forEach((key) => queryParams.append("keys", key));
  return axiosInstance
    .get(`/api/resources/by-keys?${queryParams.toString()}`)
    .then((response) => response.data);
};
