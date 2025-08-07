import { useEffect } from "react";
import { incrementTourViewCountWithSession } from "../services/tour.service";
import { useAuth } from "./useAuth";

/**
 * Custom hook for tracking tour views with session-based strategy
 *
 * This hook automatically increments the view count for a tour when:
 * - The tour data is successfully loaded
 * - The tour hasn't been viewed in the current session within the last 30 minutes
 * - There are no loading or error states
 * - User is authenticated (to prevent being kicked out)
 *
 * @param tourId - The ID of the tour to track views for
 * @param isLoading - Whether the tour data is still loading
 * @param hasError - Whether there was an error loading the tour data
 */
export const useTourViewTracking = (
  tourId: number | null | undefined,
  isLoading: boolean,
  hasError: boolean
) => {
  const { user } = useAuth();

  useEffect(() => {
    // Only increment view count if:
    // 1. We have a valid tour ID
    // 2. Data is not loading
    // 3. There are no errors
    // 4. User is authenticated (to prevent being kicked out)
    if (tourId && !isLoading && !hasError && user) {
      incrementTourViewCountWithSession(tourId).catch((error) => {
        console.warn("Failed to increment view count:", error);
      });
    }
  }, [tourId, isLoading, hasError, user]);
};

export default useTourViewTracking;
