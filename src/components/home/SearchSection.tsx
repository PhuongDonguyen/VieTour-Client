import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Search,
  Mountain,
  Ship,
  Utensils,
  Building,
  Umbrella,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { fetchProvinces, Province } from "../../services/province.service";
import { fetchActiveTourCategories } from "../../services/tourCategory.service";

interface TourCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export const SearchSection = () => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [tourCategories, setTourCategories] = useState<TourCategory[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { isVisible, elementRef } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
    triggerOnce: true,
  });

  // Load provinces and tour categories from API
  useEffect(() => {
    loadProvinces();
    loadTourCategories();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const provincesData = await fetchProvinces();
      setProvinces(provincesData);
    } catch (error) {
      console.error("Error loading provinces:", error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadTourCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await fetchActiveTourCategories();
      setTourCategories(categoriesData);
    } catch (error) {
      console.error("Error loading tour categories:", error);
      // Fallback to default categories if API fails
      setTourCategories([
        { id: 1, name: "Du lịch miền Bắc", slug: "mien-bac", is_active: true },
        {
          id: 2,
          name: "Du lịch miền Trung",
          slug: "mien-trung",
          is_active: true,
        },
        { id: 3, name: "Du lịch miền Nam", slug: "mien-nam", is_active: true },
        { id: 4, name: "Du lịch biển", slug: "du-lich-bien", is_active: true },
        { id: 5, name: "Du lịch núi", slug: "du-lich-nui", is_active: true },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Generate quick filters from tour categories
  const getQuickFilters = () => {
    if (tourCategories.length === 0) return [];

    // Generate gradient colors for categories
    const gradients = [
      "from-emerald-500 to-green-600",
      "from-blue-500 to-cyan-600",
      "from-amber-500 to-orange-600",
      "from-red-500 to-pink-600",
      "from-violet-500 to-purple-600",
      "from-indigo-500 to-blue-600",
      "from-pink-500 to-rose-600",
      "from-yellow-500 to-orange-600",
    ];

    const lightBgs = [
      "bg-emerald-50 hover:bg-emerald-100",
      "bg-blue-50 hover:bg-blue-100",
      "bg-amber-50 hover:bg-amber-100",
      "bg-red-50 hover:bg-red-100",
      "bg-violet-50 hover:bg-violet-100",
      "bg-indigo-50 hover:bg-indigo-100",
      "bg-pink-50 hover:bg-pink-100",
      "bg-yellow-50 hover:bg-yellow-100",
    ];

    const textColors = [
      "text-emerald-700",
      "text-blue-700",
      "text-amber-700",
      "text-red-700",
      "text-violet-700",
      "text-indigo-700",
      "text-pink-700",
      "text-yellow-700",
    ];

    return tourCategories.slice(0, 8).map((category, index) => {
      return {
        label: category.name,
        categoryId: category.id.toString(),
        gradient: gradients[index % gradients.length],
        lightBg: lightBgs[index % lightBgs.length],
        textColor: textColors[index % textColors.length],
      };
    });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location && location !== "all") {
      const provinceName = provinces.find((p) => p.code === location)?.name;
      if (provinceName) params.set("location", provinceName);
    }
    if (date) params.set("schedule", date);
    if (priceRange && priceRange.length === 2) {
      if (priceRange[0] > 0) params.set("min_price", priceRange[0].toString());
      if (priceRange[1] < 10000000)
        params.set("max_price", priceRange[1].toString());
    }

    console.log("Searching with params:", params.toString());
    // window.location.href = `/search${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const quickFilters = getQuickFilters();

  const formatPrice = (value: number) => {
    if (value === 0) return "0";
    if (value >= 1000000) {
      const millions = value / 1000000;
      // Hiển thị 1 chữ số thập phân nếu cần
      return millions % 1 === 0
        ? millions.toFixed(0) + "M"
        : millions.toFixed(1) + "M";
    }
    if (value >= 1000) {
      const thousands = value / 1000;
      // Hiển thị 1 chữ số thập phân nếu cần
      return thousands % 1 === 0
        ? thousands.toFixed(0) + "K"
        : thousands.toFixed(1) + "K";
    }
    return value.toString();
  };

  return (
    <div
      ref={elementRef}
      className={`relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-16">
            <div
              className={`inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6 transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Khám phá Việt Nam
              </span>
            </div>

            <h1
              className={`text-3xl md:text-5xl font-bold mb-6 leading-tight transition-all duration-700 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <span className="inline-block text-gray-900">Tìm Kiếm</span>
              <br />
              <span className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Chuyến Du Lịch
              </span>
              <br />
              <span className="text-gray-900">Hoàn Hảo</span>
            </h1>

            <p
              className={`text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-400 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Khám phá vẻ đẹp Việt Nam với những tour được chọn lọc từ các nhà
              cung cấp du lịch uy tín
            </p>
          </div>

          {/* Search card */}
          <div
            className={`bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-700 delay-500 ${
              isSearchFocused ? "shadow-blue-500/10 scale-[1.02]" : ""
            } ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Search inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
              {/* Location */}
              <div className="lg:col-span-1">
                <div className="relative group">
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger
                      className="w-full h-16 pl-12 pr-4 text-gray-900 bg-gray-50/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none group-hover:border-gray-300"
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                    >
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
                      <SelectValue placeholder="Bạn muốn đi đâu?" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {loadingProvinces ? (
                        <SelectItem value="loading" disabled>
                          Đang tải...
                        </SelectItem>
                      ) : (
                        provinces.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date */}
              <div className="lg:col-span-1">
                <div className="relative group">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full h-16 pl-12 pr-4 text-gray-900 bg-gray-50/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:bg-white transition-all duration-300 outline-none group-hover:border-gray-300"
                  />
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>

              {/* Price Range */}
              <div className="lg:col-span-1">
                <div className="relative group">
                  <div className="bg-gray-50/50 border-2 border-gray-200/50 rounded-2xl p-4 focus-within:border-blue-500 focus-within:bg-white transition-all duration-300 group-hover:border-gray-300 h-16 flex flex-col justify-center">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={10000000}
                      step={100000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-1">
                <button
                  onClick={handleSearch}
                  className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Tìm Tour
                </button>
              </div>
            </div>

            {/* Quick filters */}
            <div className="space-y-4">
              <h3
                className={`text-sm font-medium text-gray-500 uppercase tracking-wide transition-all duration-700 delay-600 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                Tìm kiếm nhanh
              </h3>
              <div className="flex flex-wrap gap-3">
                {quickFilters.map((filter, index) => (
                  <button
                    key={filter.label}
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("tour_category_id", filter.categoryId);

                      // Thêm thông tin về tỉnh thành nếu đã chọn
                      if (location && location !== "all") {
                        const provinceName = provinces.find(
                          (p) => p.code === location
                        )?.name;
                        if (provinceName) params.set("location", provinceName);
                      }

                      // Thêm thông tin về thời gian nếu đã chọn
                      if (date) {
                        params.set("schedule", date);
                      }

                      // Thêm thông tin về khoảng giá nếu đã thay đổi
                      if (priceRange && priceRange.length === 2) {
                        if (priceRange[0] > 0)
                          params.set("min_price", priceRange[0].toString());
                        if (priceRange[1] < 10000000)
                          params.set("max_price", priceRange[1].toString());
                      }

                      console.log(
                        `Quick search with params: ${params.toString()}`
                      );
                      // Chuyển hướng đến trang search với params
                      window.location.href = `/search${
                        params.toString() ? `?${params.toString()}` : ""
                      }`;
                    }}
                    className={`group ${filter.lightBg} ${
                      filter.textColor
                    } px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/50 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${700 + index * 100}ms` }}
                  >
                    <span className="text-sm font-semibold">
                      {filter.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
