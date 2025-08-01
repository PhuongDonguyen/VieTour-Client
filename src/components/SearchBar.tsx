import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllTours } from '../apis/tour.api';
import type { Tour } from '../apis/tour.api';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  isScrolled?: boolean;
  textDark?: boolean;
}

export const SearchBar = ({ 
  className = '', 
  placeholder = "Tìm kiếm tour...",
  isScrolled = false,
  textDark = false
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Tour[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const navigate = useNavigate();

  // Debounced search function
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      setShowResults(false);
      return;
    }

    if (searchTerm.trim().length < 2) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      
      try {
        const response = await getAllTours({
          search: searchTerm.trim(),
          is_active: true,
          limit: 10
        });
        
        setSearchResults(response.data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setHasSearched(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchTerm('');
  };

  const handleInputFocus = () => {
    if (hasSearched && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className={`pl-10 pr-10 py-2 rounded-full border focus:outline-none focus:border-orange-500 w-full ${
            isScrolled || textDark
              ? 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'
              : 'border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70'
          }`}
        />
        
        {/* Search Icon */}
        <Search 
          className={`absolute left-3 top-2.5 w-4 h-4 ${
            isScrolled || textDark ? 'text-gray-400' : 'text-white/70'
          }`} 
        />
        
        {/* Loading or Clear Icon */}
        <div className="absolute right-3 top-2.5">
          {isSearching ? (
            <Loader2 className={`w-4 h-4 animate-spin ${
              isScrolled || textDark ? 'text-gray-400' : 'text-white/70'
            }`} />
          ) : searchTerm && (
            <button
              onClick={handleClearSearch}
              className={`hover:opacity-70 transition-opacity ${
                isScrolled || textDark ? 'text-gray-400' : 'text-white/70'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {searchResults.length > 0 ? (
            <div className="py-2">
                             {searchResults.map((tour) => (
                 <Link
                   key={tour.id}
                   to={`/tour/${tour.slug}`}
                   onClick={handleResultClick}
                   className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 block"
                 >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {tour.poster_url ? (
                        <img
                          src={tour.poster_url}
                          alt={tour.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No img</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {tour.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {tour.duration}
                      </p>
                      <p className="text-sm font-semibold text-orange-600 mt-1">
                        từ {formatPrice(tour.price)}
                      </p>
                                         </div>
                   </div>
                 </Link>
               ))}
            </div>
          ) : hasSearched ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 text-sm">
                Không tìm thấy tour nào phù hợp
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 