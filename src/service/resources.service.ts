import axiosInstance from '../apis/axiosInstance';
import type { ResourceItem } from '../apis/resources.api';
import { RESOURCES_API } from '../apis/resources.api';

export const resourcesService = {
  async fetchResources(): Promise<ResourceItem[]> {
    const res = await axiosInstance.get<{ success: boolean; data: ResourceItem[] }>(RESOURCES_API.BASE);
    return res.data.data;
  },
}; 