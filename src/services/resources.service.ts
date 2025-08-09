import {
  getResources,
  getResourceById,
  getResourceByKey,
  getResourcesByKeys,
  type ResourceItem,
} from "../apis/resources.api";

export const resourcesService = {
  // Get all resources
  async fetchResources(): Promise<ResourceItem[]> {
    try {
      const res = await getResources();
      return res.data;
    } catch (error) {
      console.error("Error fetching resources:", error);
      return [];
    }
  },

  // Get resource by ID
  async fetchResourceById(id: number): Promise<ResourceItem | null> {
    try {
      const res = await getResourceById(id);
      return res.data;
    } catch (error) {
      console.error("Error fetching resource by ID:", error);
      return null;
    }
  },

  // Get resource by key
  async fetchResourceByKey(key: string): Promise<ResourceItem | null> {
    try {
      const res = await getResourceByKey(key);
      return res.data;
    } catch (error) {
      console.error("Error fetching resource by key:", error);
      return null;
    }
  },

  // Get multiple resources by keys
  async fetchResourcesByKeys(keys: string[]): Promise<ResourceItem[]> {
    try {
      const res = await getResourcesByKeys(keys);
      return res.data;
    } catch (error) {
      console.error("Error fetching resources by keys:", error);
      return [];
    }
  },

  // Get resource content by key (convenience method)
  async getResourceContent(key: string): Promise<string> {
    try {
      const resource = await this.fetchResourceByKey(key);
      return resource?.content || "";
    } catch (error) {
      console.error("Error fetching resource content:", error);
      return "";
    }
  },
};
