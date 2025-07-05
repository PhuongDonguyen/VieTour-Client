import { Star } from "lucide-react";

export const FloatingCard = () => {
  return (
    <div className="absolute bottom-20 left-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white max-w-sm hidden lg:block">
      <div className="flex items-center space-x-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold">Tour được yêu thích nhất</span>
      </div>
      <h3 className="font-bold text-lg mb-2">Điểm đến hấp dẫn</h3>
      <p className="text-sm text-white/80">
        Khám phá vẻ đẹp hoang sơ của miền Tây Nam Bộ với những trải nghiệm độc đáo và khó quên.
      </p>
    </div>
  );
}; 