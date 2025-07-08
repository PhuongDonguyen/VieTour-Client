import { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

export const TourByCategory = () => {
  const { slug } = useParams<{ slug: string }>();

  const [tourCategories, setTourCategories] = useState([]);
  
  return (
    <div className="max-w-7xl mx-auto mt-20 p-4 bg-white">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">
        Tour By Category
      </h2>
      {/* Render your tour categories here */}
    </div>
  );
};
