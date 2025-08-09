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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

interface Province {
  code: string;
  name: string;
}

export const SearchSection = () => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [tourType, setTourType] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  const tourTypes = [
    { value: "all", label: "Tất cả loại tour" },
    { value: "1", label: "Du lịch miền Bắc" },
    { value: "2", label: "Du lịch miền Trung" },
    { value: "3", label: "Du lịch miền Nam" },
    { value: "4", label: "Du lịch biển" },
    { value: "5", label: "Du lịch núi" },
  ];

  // Load provinces from API
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Error loading provinces:", error);
      // Fallback to static list if API fails
      const fallbackLocations = [
        { code: "hanoi", name: "Hà Nội" },
        { code: "hochiminh", name: "TP. Hồ Chí Minh" },
        { code: "danang", name: "Đà Nẵng" },
        { code: "hue", name: "Huế" },
        { code: "halong", name: "Hạ Long" },
        { code: "sapa", name: "Sapa" },
        { code: "nhatrang", name: "Nha Trang" },
        { code: "phuquoc", name: "Phú Quốc" },
      ];
      setProvinces(fallbackLocations);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const quickFilters = [
    {
      icon: Mountain,
      label: "Du lịch núi",
      categoryId: "5",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: Ship,
      label: "Du lịch biển",
      categoryId: "4",
      color: "bg-blue-400 hover:bg-blue-500",
    },
    {
      icon: Building,
      label: "Du lịch miền Bắc",
      categoryId: "1",
      color: "bg-amber-600 hover:bg-amber-700",
    },
    {
      icon: Utensils,
      label: "Du lịch miền Trung",
      categoryId: "2",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: Umbrella,
      label: "Du lịch miền Nam",
      categoryId: "3",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  const handleSearch = () => {
    // Navigate to search page with query params
    const params = new URLSearchParams();
    if (location && location !== "all") {
      const provinceName = provinces.find((p) => p.code === location)?.name;
      if (provinceName) params.set("location", provinceName);
    }
    if (date) params.set("schedule", date);
    if (tourType && tourType !== "all") {
      // Map tourType to category if needed
      params.set("tour_category_id", tourType);
    }

    console.log("🏠 Home SearchSection - Navigating to search with params:", params.toString());
    const queryString = params.toString();
    window.location.href = `/search${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-blue-400 via-cyan-400 to-orange-300 flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6">
        {/* Main heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Tìm Kiếm{" "}
            <span className="text-amber-300 drop-shadow-lg">
              Chuyến Du Lịch Hoàn Hảo
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Khám phá vẻ đẹp Việt Nam với những tour được chọn lọc từ các nhà
            cung cấp địa phương uy tín
          </p>
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Main search inputs */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Location */}
            <div className="flex-1">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-14 text-left">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                  <SelectValue placeholder="Bạn muốn đi đâu?" />
                </SelectTrigger>
                <SelectContent
                  className="z-[9999]"
                  position="popper"
                  sideOffset={4}
                >
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

            {/* Date */}
            <div className="flex-1">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-14 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ngày/tháng/năm"
                />
              </div>
            </div>

            {/* Tour Type */}
            <div className="flex-1">
              <Select value={tourType} onValueChange={setTourType}>
                <SelectTrigger className="h-14 text-left">
                  <SelectValue placeholder="Loại tour" />
                </SelectTrigger>
                <SelectContent>
                  {tourTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              Tìm Tour
            </Button>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("tour_category_id", filter.categoryId);
                  window.location.href = `/search?${params.toString()}`;
                }}
                className={`${filter.color} text-white px-4 py-2 rounded-full font-medium transition-colors duration-200 flex items-center gap-2 hover:scale-105 transform`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
