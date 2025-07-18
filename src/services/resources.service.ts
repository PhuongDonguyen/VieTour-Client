import { getResources } from '../apis/resources.api';
import type { ResourceItem } from '../apis/resources.api';

export const resourcesService = {
  async fetchResources(): Promise<ResourceItem[]> {
    const res = await getResources();
    return res.data.data;
  },
}; 