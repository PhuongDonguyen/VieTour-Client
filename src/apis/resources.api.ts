export const RESOURCES_API = {
  BASE: 'http://localhost:8000/api/resources',
};

export interface ResourceItem {
  id: number;
  key: string;
  content: string;
} 