// import { getAllBlogCategories } from '../apis/blogCategory.api';

// Interface for blog categories
export interface BlogCategory {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  post_count?: number;
  created_at?: string;
  is_active?: boolean;
}

// Mock data for development - replace with actual API calls
const mockCategories: BlogCategory[] = [
  {
    id: 1,
    name: 'Travel Guides',
    slug: 'travel-guides',
    description: 'Comprehensive guides for travelers exploring different destinations',
    color: '#3B82F6',
    post_count: 12,
    created_at: '2024-01-15',
    is_active: true
  },
  {
    id: 2,
    name: 'Food & Culture',
    slug: 'food-culture',
    description: 'Exploring local cuisines and cultural experiences',
    color: '#EF4444',
    post_count: 8,
    created_at: '2024-01-20',
    is_active: true
  },
  {
    id: 3,
    name: 'Tips & Tricks',
    slug: 'tips-tricks',
    description: 'Helpful travel tips and insider secrets',
    color: '#10B981',
    post_count: 15,
    created_at: '2024-02-01',
    is_active: true
  },
  {
    id: 4,
    name: 'Destinations',
    slug: 'destinations',
    description: 'Featured destinations and hidden gems',
    color: '#F59E0B',
    post_count: 20,
    created_at: '2024-02-10',
    is_active: true
  }
];

export const fetchBlogCategories = async (): Promise<BlogCategory[]> => {
  try {
    // Replace with actual API call when ready
    // return await getAllBlogCategories();

    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return mockCategories; // Fallback to mock data
  }
};

export const fetchActiveBlogCategories = async (): Promise<BlogCategory[]> => {
  try {
    const categories = await fetchBlogCategories();
    return categories.filter(cat => cat.is_active !== false);
  } catch (error) {
    console.error('Error fetching active categories:', error);
    return mockCategories.filter(cat => cat.is_active !== false);
  }
};

export const createBlogCategory = async (categoryData: Omit<BlogCategory, 'id' | 'created_at' | 'post_count'>): Promise<BlogCategory> => {
  // TODO: Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 200));
  const newCategory: BlogCategory = {
    ...categoryData,
    id: Date.now(),
    post_count: 0,
    created_at: new Date().toISOString().split('T')[0]
  };
  mockCategories.push(newCategory);
  return newCategory;
};

export const updateBlogCategory = async (id: number, categoryData: Partial<BlogCategory>): Promise<BlogCategory> => {
  // TODO: Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = mockCategories.findIndex(cat => cat.id === id);
  if (index !== -1) {
    mockCategories[index] = { ...mockCategories[index], ...categoryData };
    return mockCategories[index];
  }
  throw new Error('Category not found');
};

export const deleteBlogCategory = async (id: number): Promise<void> => {
  // TODO: Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = mockCategories.findIndex(cat => cat.id === id);
  if (index !== -1) {
    mockCategories.splice(index, 1);
  }
};

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}; 