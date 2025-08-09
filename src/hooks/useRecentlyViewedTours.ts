import { useState, useEffect, useCallback } from "react";
import {
  getRecentlyViewedTours,
  addRecentlyViewedTour,
  removeRecentlyViewedTour,
  clearRecentlyViewedTours,
  getRecentlyViewedCount,
  isTourRecentlyViewed,
  type RecentlyViewedTour,
} from "../services/recentlyViewedTours.service";
import { Tour } from "../apis/tour.api";

/**
 * Custom hook for managing recently viewed tours
 * Provides reactive state management and utility functions
 */
export const useRecentlyViewedTours = () => {
  const [recentTours, setRecentTours] = useState<RecentlyViewedTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tours from sessionStorage
  const loadTours = useCallback(() => {
    setIsLoading(true);
    try {
      const tours = getRecentlyViewedTours();
      setRecentTours(tours);
    } catch (error) {
      console.error("Error loading recently viewed tours:", error);
      setRecentTours([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a tour to recently viewed
  const addTour = useCallback((tour: Tour) => {
    try {
      addRecentlyViewedTour(tour);
      loadTours();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("recentlyViewedUpdated"));
    } catch (error) {
      console.error("Error adding tour to recently viewed:", error);
    }
  }, [loadTours]);

  // Remove a tour from recently viewed
  const removeTour = useCallback((tourId: number) => {
    try {
      removeRecentlyViewedTour(tourId);
      loadTours();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("recentlyViewedUpdated"));
    } catch (error) {
      console.error("Error removing tour from recently viewed:", error);
    }
  }, [loadTours]);

  // Clear all recently viewed tours
  const clearAll = useCallback(() => {
    try {
      clearRecentlyViewedTours();
      loadTours();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("recentlyViewedUpdated"));
    } catch (error) {
      console.error("Error clearing recently viewed tours:", error);
    }
  }, [loadTours]);

  // Check if a tour is recently viewed
  const isRecentlyViewed = useCallback((tourId: number): boolean => {
    return isTourRecentlyViewed(tourId);
  }, []);

  // Get count of recently viewed tours
  const count = getRecentlyViewedCount();

  // Load tours on mount and listen for updates
  useEffect(() => {
    loadTours();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "recently_viewed_tours") {
        loadTours();
      }
    };

    // Listen for custom events from same window
    const handleCustomUpdate = () => {
      loadTours();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("recentlyViewedUpdated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("recentlyViewedUpdated", handleCustomUpdate);
    };
  }, [loadTours]);

  return {
    // State
    recentTours,
    isLoading,
    count,
    
    // Actions
    addTour,
    removeTour,
    clearAll,
    isRecentlyViewed,
    refresh: loadTours,
  };
};

/**
 * Hook for automatically tracking tour views
 * Use this in tour detail pages to automatically add tours to recently viewed
 */
export const useAutoTrackTourView = (
  tour: Tour | null,
  isLoading: boolean,
  hasError: boolean
) => {
  const { addTour } = useRecentlyViewedTours();

  useEffect(() => {
    // Only add to recently viewed if:
    // 1. We have valid tour data
    // 2. Data is not loading
    // 3. There are no errors
    if (tour && !isLoading && !hasError) {
      // Add a small delay to ensure the page has loaded properly
      const timeoutId = setTimeout(() => {
        addTour(tour);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [tour, isLoading, hasError, addTour]);
};

export default useRecentlyViewedTours;
