import {
  getTours,
  getToursByIsActive,
  incrementTourViewCount,
  getAllTours,
  getTourById,
  getTourBySlug,
  getTourDetail,
  getTourImages,
  getTopBookedTours,
  getToursByCatId,
  type TourResponse,
  type TourQueryParams,
} from "../apis/tour.api";

export const fetchTours = async (params?: TourQueryParams): Promise<TourResponse> => {
  const res = await getAllTours(params);
  return res;
};

export const fetchTourBySlug = async (slug: string) => {
  const res = await getTourBySlug(slug);
  if (res.data && res.data.success && res.data.data.length > 0) return res.data.data[0];
  throw new Error("Tour not found");
};

export const fetchTourDetail = async (tour_id: number) => {
  const res = await getTourDetail(tour_id);
  if (res.data && res.data.success) return res.data.data;
  throw new Error("Tour detail not found");
};

export const fetchTourImages = async (tour_id: number) => {
  const res = await getTourImages(tour_id);
  if (res.data && res.data.success) return res.data.data;
  throw new Error("Tour images not found");
};

export const fetchTopBookedTours = async (limit: number = 5) => {
  const res = await getTopBookedTours(limit);
  if (res.data && res.data.success) return res.data.data.slice(0, limit);
  throw new Error("Failed to fetch top booked tours");
};

export const fetchToursByCategoryId = async (categoryId: number) => {
  const res = await getToursByCatId(categoryId);
  if (res.data && res.data.success) return res.data.data;
  throw new Error("Failed to fetch tours by category");
};

export const fetchTourIsActive = async (is_active: boolean) => {
  const res = await getToursByIsActive(is_active);
  if (res.data && res.data.success) return res.data.data;
  throw new Error("Failed to fetch tours by active status");
};

export const fetchTourById = async (tour_id: number) => {
  const res = await getTourById(tour_id);
  if (res.data) return res.data;
  throw new Error("Không tìm thấy tour");
};

// Session-based view count increment
//
// This implementation prevents duplicate view count increments by tracking viewed tours
// in sessionStorage with a 30-minute expiry window. This means:
// - Each tour can only increment the view count once per 30-minute session
// - View records are stored per browser session (not persistent across browser restarts)
// - Expired records are automatically cleaned up
// - Failed API calls don't prevent page loading
//
// Usage: Call incrementTourViewCountWithSession(tourId) when a tour page loads
//
const VIEW_COUNT_SESSION_KEY = "tour_views_session";
const VIEW_COUNT_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

interface ViewRecord {
  tourId: number;
  timestamp: number;
}

// Get viewed tours from sessionStorage
const getViewedTours = (): ViewRecord[] => {
  try {
    const stored = sessionStorage.getItem(VIEW_COUNT_SESSION_KEY);
    if (!stored) return [];

    const records: ViewRecord[] = JSON.parse(stored);
    const now = Date.now();

    // Filter out expired records (older than 30 minutes)
    const validRecords = records.filter(
      (record) => now - record.timestamp < VIEW_COUNT_EXPIRY
    );

    // Update sessionStorage with valid records only
    if (validRecords.length !== records.length) {
      sessionStorage.setItem(
        VIEW_COUNT_SESSION_KEY,
        JSON.stringify(validRecords)
      );
    }

    return validRecords;
  } catch (error) {
    console.warn("Error reading tour view records from sessionStorage:", error);
    return [];
  }
};

// Check if tour has been viewed recently
const hasTourBeenViewedRecently = (tourId: number): boolean => {
  const viewedTours = getViewedTours();
  return viewedTours.some((record) => record.tourId === tourId);
};

// Mark tour as viewed
const markTourAsViewed = (tourId: number): void => {
  try {
    const viewedTours = getViewedTours();
    const newRecord: ViewRecord = {
      tourId,
      timestamp: Date.now(),
    };

    // Add new record (don't worry about duplicates, they'll be filtered by time)
    const updatedRecords = [...viewedTours, newRecord];
    sessionStorage.setItem(
      VIEW_COUNT_SESSION_KEY,
      JSON.stringify(updatedRecords)
    );
  } catch (error) {
    console.warn("Error saving tour view record to sessionStorage:", error);
  }
};

// Main function to increment view count with session strategy
export const incrementTourViewCountWithSession = async (
  tourId: number
): Promise<void> => {
  try {
    // Check if this tour has been viewed recently in this session
    if (hasTourBeenViewedRecently(tourId)) {
      console.log(
        `Tour ${tourId} has been viewed recently in this session. Skipping view count increment.`
      );
      return;
    }

    // Call API to increment view count
    const response = await incrementTourViewCount(tourId);

    if (response.data && response.data.success) {
      // Mark this tour as viewed in the session
      markTourAsViewed(tourId);
      console.log(`View count incremented for tour ${tourId}`);
    } else {
      console.warn("API responded but without success flag");
    }
  } catch (error) {
    console.error("Error incrementing tour view count:", error);
    // Don't throw error to avoid breaking the page load
  }
};

// Utility functions for debugging and maintenance
export const clearAllTourViewRecords = (): void => {
  try {
    sessionStorage.removeItem(VIEW_COUNT_SESSION_KEY);
    console.log("All tour view records cleared from session");
  } catch (error) {
    console.warn("Error clearing tour view records:", error);
  }
};

export const getTourViewRecords = (): ViewRecord[] => {
  return getViewedTours();
};

export const getTourViewStatus = (
  tourId: number
): {
  hasBeenViewed: boolean;
  lastViewTime?: Date;
  minutesAgo?: number;
} => {
  const viewedTours = getViewedTours();
  const record = viewedTours.find((r) => r.tourId === tourId);

  if (!record) {
    return { hasBeenViewed: false };
  }

  const lastViewTime = new Date(record.timestamp);
  const minutesAgo = Math.floor((Date.now() - record.timestamp) / (1000 * 60));

  return {
    hasBeenViewed: true,
    lastViewTime,
    minutesAgo,
  };
};
