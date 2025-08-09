import { Tour } from '../apis/tour.api';

// ============================================================================
// RECENTLY VIEWED TOURS SERVICE
// ============================================================================
//
// Simple service for managing recently viewed tours in sessionStorage:
// - Stores tour basic information (id, title, slug, poster_url, price, etc.)
// - Maintains order (most recent first)
// - Limits to maximum number of items
// - Persistent across page reloads but cleared on browser restart
//
// Usage:
// - Call addRecentlyViewedTour(tour) when user views a tour detail page
// - Call getRecentlyViewedTours() to retrieve the list for display
// - Call clearRecentlyViewedTours() to reset the list
// ============================================================================

const RECENTLY_VIEWED_KEY = "recently_viewed_tours";
const MAX_RECENTLY_VIEWED = 10; // Maximum number of tours to keep

export interface RecentlyViewedTour {
  id: number;
  title: string;
  slug: string;
  poster_url: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  tour_category?: {
    id: number;
    name: string;
  };
}

/**
 * Get recently viewed tours from sessionStorage
 */
export const getRecentlyViewedTours = (): RecentlyViewedTour[] => {
  try {
    const stored = sessionStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) return [];

    const tours: RecentlyViewedTour[] = JSON.parse(stored);
    return tours;
  } catch (error) {
    console.warn("Error reading recently viewed tours from sessionStorage:", error);
    return [];
  }
};

/**
 * Add a tour to recently viewed list
 * - Moves to top if already exists
 * - Adds to top if new
 * - Maintains maximum limit
 */
export const addRecentlyViewedTour = (tour: Tour): void => {
  try {
    const currentTours = getRecentlyViewedTours();
    
    // Create the recently viewed tour object with essential data
    const recentTour: RecentlyViewedTour = {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      poster_url: tour.poster_url,
      price: tour.price,
      discountedPrice: tour.discountedPrice,
      duration: tour.duration,
      tour_category: tour.tour_category,
    };

    // Remove the tour if it already exists (to avoid duplicates)
    const filteredTours = currentTours.filter((t) => t.id !== tour.id);

    // Add the tour at the beginning (most recent first)
    const updatedTours = [recentTour, ...filteredTours];

    // Keep only the maximum number of tours
    const limitedTours = updatedTours.slice(0, MAX_RECENTLY_VIEWED);

    sessionStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(limitedTours));
    
    console.log(`Added tour "${tour.title}" to recently viewed list`);
  } catch (error) {
    console.warn("Error saving recently viewed tour to sessionStorage:", error);
  }
};

/**
 * Remove a specific tour from recently viewed list
 */
export const removeRecentlyViewedTour = (tourId: number): void => {
  try {
    const currentTours = getRecentlyViewedTours();
    const filteredTours = currentTours.filter((tour) => tour.id !== tourId);
    
    sessionStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filteredTours));
    console.log(`Removed tour ID ${tourId} from recently viewed list`);
  } catch (error) {
    console.warn("Error removing tour from recently viewed list:", error);
  }
};

/**
 * Clear all recently viewed tours
 */
export const clearRecentlyViewedTours = (): void => {
  try {
    sessionStorage.removeItem(RECENTLY_VIEWED_KEY);
    console.log("Cleared all recently viewed tours");
  } catch (error) {
    console.warn("Error clearing recently viewed tours:", error);
  }
};

/**
 * Check if a tour is in the recently viewed list
 */
export const isTourRecentlyViewed = (tourId: number): boolean => {
  const recentTours = getRecentlyViewedTours();
  return recentTours.some((tour) => tour.id === tourId);
};

/**
 * Get count of recently viewed tours
 */
export const getRecentlyViewedCount = (): number => {
  return getRecentlyViewedTours().length;
};

/**
 * Get recently viewed tours with limit
 */
export const getRecentlyViewedToursLimited = (limit: number): RecentlyViewedTour[] => {
  const tours = getRecentlyViewedTours();
  return tours.slice(0, limit);
};

// Debug utility functions
export const debugRecentlyViewedTours = () => {
  const tours = getRecentlyViewedTours();
  console.table(tours.map(tour => ({
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    price: tour.price,
  })));
};
