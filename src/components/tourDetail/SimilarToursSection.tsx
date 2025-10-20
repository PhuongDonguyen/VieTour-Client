import React, { useEffect, useState } from "react";
import { Sparkles, MapPin, Clock } from "lucide-react";
import { searchSimilarTours, SimilarTour } from "../../apis/tour.api";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Props {
    tourTitle: string;
    currentTourId?: number;
}

const CARD_COUNT = 5;

const SimilarToursSection: React.FC<Props> = ({ tourTitle, currentTourId }) => {
    const [similarTours, setSimilarTours] = useState<SimilarTour[]>([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    useEffect(() => {
        if (!tourTitle) return;
        setLoadingSimilar(true);
        searchSimilarTours({ tourInfo: tourTitle })
            .then((res) => {
                if (res.success && Array.isArray(res.tours)) {
                    setSimilarTours(res.tours);
                } else {
                    setSimilarTours([]);
                }
            })
            .catch(() => setSimilarTours([]))
            .finally(() => setLoadingSimilar(false));
    }, [tourTitle]);

    // Format price
    const formatPrice = (price: number) => (
        <span className="text-red-500 font-bold text-sm">
            {price ? price.toLocaleString("vi-VN") + "đ" : "Liên hệ"}
        </span>
    );

    // Filter out current tour
    const filteredTours = similarTours.filter(
        (tour) => tour.tour_id !== currentTourId
    );

    return (
        <div className="w-full max-w-7xl mx-auto mb-10">
            <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Gợi ý tour tương tự</h3>
            </div>
            {loadingSimilar ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {Array.from({ length: CARD_COUNT }).map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                        >
                            <Skeleton height={160} />
                            <div className="p-5">
                                <Skeleton height={24} width={120} style={{ marginBottom: 8 }} />
                                <Skeleton height={18} width={80} />
                                <Skeleton height={18} width={80} />
                                <Skeleton height={14} width={60} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredTours.length === 0 ? (
                <div className="text-gray-400">Không tìm thấy tour tương tự.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredTours.map((tour) => (
                        <Link
                            key={tour.tour_id}
                            to={`/tour/${tour.slug}`}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="relative">
                                <img
                                    src={tour.poster_url || "/VieTour-Logo.png"}
                                    alt={tour.name}
                                    className="w-full h-40 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/avatar-default.jpg";
                                    }}
                                />
                            </div>
                            <div className="p-5">
                                <h4 className="font-medium text-gray-900 text-base leading-tight mb-3 group-hover:text-orange-600 transition-colors line-clamp-2 h-12">
                                    {tour.name}
                                </h4>
                                <div className="space-y-3">
                                    <div>{formatPrice(tour.price)}</div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {tour.duration}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span className="max-w-20 truncate">{tour.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SimilarToursSection;