import { useEffect, useState } from "react";
import { resourcesService } from "../services/resources.service";
import { Heart, Users, Star, MapPin } from "lucide-react";
import CountUp from "react-countup";

export default function About() {
  const [introduce, setIntroduce] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    resourcesService.fetchResources().then((data) => {
      const intro = data.find((item) => item.key === "introduce");
      setIntroduce(intro ? intro.content : "");
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative mt-20 mb-1 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Về <span className="text-blue-600">VieTour</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Chúng tôi là đối tác du lịch đáng tin cậy của bạn, 
            mang đến những trải nghiệm du lịch tuyệt vời và đáng nhớ
          </p>
          
                     {/* Simple Stats */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
             <div className="text-center">
               <div className="text-3xl font-bold text-blue-600 mb-2">
                 <CountUp end={10} suffix="K+" duration={2.5} />
               </div>
               <div className="text-gray-600">Khách hàng hài lòng</div>
             </div>
             <div className="text-center">
               <div className="text-3xl font-bold text-blue-600 mb-2">
                 <CountUp end={500} suffix="+" duration={2.5} />
               </div>
               <div className="text-gray-600">Điểm đến</div>
             </div>
             <div className="text-center">
               <div className="text-3xl font-bold text-blue-600 mb-2">
                 <CountUp end={4.9} decimals={1} duration={2.5} />
               </div>
               <div className="text-gray-600">Đánh giá trung bình</div>
             </div>
             <div className="text-center">
               <div className="text-3xl font-bold text-blue-600 mb-2">
                 <CountUp end={5} suffix="+" duration={2.5} />
               </div>
               <div className="text-gray-600">Năm kinh nghiệm</div>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/6 animate-pulse"></div>
            </div>
          ) : (
            <div 
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: introduce }}
            />
          )}
          
          {/* Simple Features */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Tại sao chọn VieTour?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-blue-50">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Trải nghiệm tuyệt vời</h4>
                <p className="text-gray-600 text-sm">
                  Cam kết mang đến những trải nghiệm du lịch đáng nhớ
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-green-50">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Dịch vụ chất lượng</h4>
                <p className="text-gray-600 text-sm">
                  Đội ngũ chuyên nghiệp, tận tâm phục vụ khách hàng
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-purple-50">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Giá cả hợp lý</h4>
                <p className="text-gray-600 text-sm">
                  Cung cấp dịch vụ chất lượng với mức giá cạnh tranh
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Liên hệ với chúng tôi
            </h3>
            <div className="flex flex-col md:flex-row justify-center gap-8 text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>📞 +84 123 456 789</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>✉️ info@vietour.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}