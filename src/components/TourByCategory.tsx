import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tourCategoryService } from "../services/tourCategoryService";
import { TourCard } from "../components/TourCard";
// import { tourService } from "../services/tourService";
import { tourPriceService } from "../services/tourPriceService";

interface TourCardProps {
  id: string;
  title: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  views: string;
  comments: string;
  participants: string;
  totalStar: number;
  reviewCount: number;
  slug: string;
  onBookTour?: (id: string) => void;
}

type TourPrice = {
  adultPrice: number;
  tourId: number;
};

export const TourByCategory = () => {
  const tourData = [
    {
      id: "cu-chi-tunnel",
      title: "TOUR ĐỊA ĐẠO CỦ CHI",
      image:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d4b86e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      originalPrice: 450000,
      discountedPrice: 350000,
      discount: 22,
      views: "56.6M",
      comments: "6M",
      participants: "57M",
    },
    {
      id: "mekong-delta",
      title: "TOUR ĐỒNG BẰNG SÔNG CỬU LONG",
      image:
        "https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      originalPrice: 580000,
      discountedPrice: 420000,
      discount: 28,
      views: "42.3M",
      comments: "3.8M",
      participants: "45M",
    },
    {
      id: "halong-bay",
      title: "TOUR VỊNH HẠ LONG 2 NGÀY 1 ĐÊM",
      image:
        "https://images.unsplash.com/photo-1528850809787-6b0c0c7e0c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      originalPrice: 1200000,
      discountedPrice: 950000,
      discount: 21,
      views: "89.1M",
      comments: "12.5M",
      participants: "78M",
    },
    {
      id: "sapa-trekking",
      title: "TOUR SAPA TREKKING 3 NGÀY 2 ĐÊM",
      image:
        "https://images.unsplash.com/photo-1601027847350-0285867c31f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      originalPrice: 1500000,
      discountedPrice: 1150000,
      discount: 23,
      views: "35.7M",
      comments: "4.2M",
      participants: "32M",
    },
    {
      id: "phu-quoc-island",
      title: "TOUR ĐẢO PHÚ QUỐC 4 NGÀY 3 ĐÊM",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      originalPrice: 2200000,
      discountedPrice: 1650000,
      discount: 25,
      views: "67.9M",
      comments: "8.3M",
      participants: "61M",
    },
    {
      id: "hoi-an-ancient",
      title: "TOUR PHỐ CỔ HỘI AN & MỸ SƠN",
      image:
        "https://images.unsplash.com/photo-1559592413-7cec4d0d7b2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      originalPrice: 750000,
      discountedPrice: 580000,
      discount: 23,
      views: "52.4M",
      comments: "6.7M",
      participants: "48M",
    },
    {
      id: "dalat-flower-city",
      title: "TOUR THÀNH PHỐ HOA ĐÀ LẠT",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      originalPrice: 890000,
      discountedPrice: 680000,
      discount: 24,
      views: "43.2M",
      comments: "5.1M",
      participants: "39M",
    },
    {
      id: "ninh-binh-tam-coc",
      title: "TOUR NINH BÌNH - TAM CỐC BÍCH ĐỘNG",
      image:
        "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      originalPrice: 650000,
      discountedPrice: 490000,
      discount: 25,
      views: "38.6M",
      comments: "4.9M",
      participants: "35M",
    },
  ];
  const { slug } = useParams<{ slug: string }>();
  const [tourCategories, setTourCategories] = useState<any>(null);
  const [tours, setTours] = useState<TourCardProps[]>([]);
  const [nameTourCategory, setNameTourCategory] = useState<string>("");
  const [tourPrices, setTourPrices] = useState<TourPrice[]>([]);
  // const [tours, setTours] = useState
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       if (!slug) return;
  //       const tourCategory = await tourCategoryService.getTourCategoryBySlug(
  //         slug
  //       );
  //       setNameTourCategory(tourCategory.data[0].name);
  //       const tourPriceRes = await tourPriceService.getAllTourPrices();
  //       const tourPricesData = tourPriceRes.data;
  //       const parsedPrices = tourPricesData.map((price: any) => ({
  //         adultPrice: price.adult_price,
  //         tourId: price.tour_id,
  //       }));
  //       const tourRes = await tourService.getToursByTourCategoryId(
  //         tourCategory.data[0].id
  //       );
  //       const tourResData = tourRes.data;
  //       setTours(
  //         tourResData.map((tour: any) => ({
  //           id: tour.id,
  //           title: tour.title,
  //           originalPrice: formatVND(
  //             getMinAdultPriceByTourId(parsedPrices, tour.id) || 0
  //           ),
  //           discountedPrice: 680000,
  //           image: tour.poster_url,
  //           totalStar: tour.total_star || 0,
  //           reviewCount: tour.review_count || 0,
  //           views: tour.view_count?.toString() || "",
  //           comments: "3.8M",
  //           participants: "45M",
  //           discount: 23,
  //           slug: tour.slug
  //         }))
  //       );
  //     } catch (error) {
  //       console.error("Lỗi khi load dữ liệu: ", error);
  //     }
  //   };
  //   fetchData();
  // }, [slug]);

  useEffect(() => {
    console.log("Tours: ", tours);
  }, [tours]);

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);

  const getMinAdultPriceByTourId = (
    prices: TourPrice[],
    tourId: number
  ): number | null => {
    const filtered = prices.filter((t) => t.tourId === tourId);
    if (filtered.length === 0) return null;

    return Math.min(...filtered.map((t) => t.adultPrice));
  };

  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-700 mb-4">
            {nameTourCategory}
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <TourCard key={index} {...tour} />
          ))}
        </div>
      </div>
    </div>
  );
};
