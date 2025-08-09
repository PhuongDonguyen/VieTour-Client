import React from "react";
import RecentlyViewedTours from "../RecentlyViewedTours";
import { useRecentlyViewedTours } from "../../hooks/useRecentlyViewedTours";

/**
 * Example component showing different ways to use RecentlyViewedTours
 */
const RecentlyViewedExample: React.FC = () => {
  const { recentTours, count, clearAll } = useRecentlyViewedTours();

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Recently Viewed Tours Examples</h1>
      
      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Total recently viewed tours: <strong>{count}</strong>
        </p>
        <button 
          onClick={clearAll}
          className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Clear All (Debug)
        </button>
      </div>

      {/* Compact version (like on home page) */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Compact Version (Home Page Style)</h2>
        <RecentlyViewedTours 
          maxItems={5}
          compact={true}
          className="mb-4"
          title="Tour đã xem gần đây"
        />
      </div>

      {/* Full version (like in sidebar) */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Full Version (Sidebar Style)</h2>
        <div className="max-w-sm">
          <RecentlyViewedTours 
            maxItems={5}
            compact={false}
            showClearAll={true}
            showRemoveButtons={true}
            title="Tour đã xem"
          />
        </div>
      </div>

      {/* Minimal version */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Minimal Version</h2>
        <div className="max-w-sm">
          <RecentlyViewedTours 
            maxItems={3}
            compact={false}
            showClearAll={false}
            showRemoveButtons={false}
            title="Lịch sử xem"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
          <li>Visit some tour detail pages (e.g., /tour/tour-slug)</li>
          <li>Come back to this page or any page with RecentlyViewedTours component</li>
          <li>You should see the tours you visited in the component</li>
          <li>Try removing individual tours or clearing all</li>
          <li>The data persists across page reloads but clears when browser restarts</li>
        </ol>
      </div>
    </div>
  );
};

export default RecentlyViewedExample;
