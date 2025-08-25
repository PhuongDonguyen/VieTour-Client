import { useEffect, useState } from "react";
import { Heart, Users, Star, MapPin, Award, Shield, Clock, Globe, CheckCircle, ArrowRight } from "lucide-react";
import CountUp from "react-countup";

export default function About() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .fade-in-up-delay-1 {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        
        .fade-in-up-delay-2 {
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }
        
        .fade-in-up-delay-3 {
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }
        
        .slide-in-left {
          animation: slideInLeft 0.8s ease-out 0.3s both;
        }
        
        .slide-in-right {
          animation: slideInRight 0.8s ease-out 0.3s both;
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-16 transition-opacity duration-700 ${isVisible ? "opacity-100 fade-in-up" : "opacity-0"}`}>
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
                Về <span className="text-orange-600">VieTour</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Chúng tôi là đối tác du lịch đáng tin cậy của bạn, 
                mang đến những trải nghiệm du lịch tuyệt vời và đáng nhớ
              </p>
            </div>
            
            {/* Stats Section */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 transition-opacity duration-700 ${isVisible ? "opacity-100 fade-in-up-delay-1" : "opacity-0"}`}>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={15} suffix="K+" duration={2.5} />
                </div>
                <div className="text-gray-600 font-medium">Khách hàng hài lòng</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={800} suffix="+" duration={2.5} />
                </div>
                <div className="text-gray-600 font-medium">Điểm đến</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={4.9} decimals={1} duration={2.5} />
                </div>
                <div className="text-gray-600 font-medium">Đánh giá trung bình</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={8} suffix="+" duration={2.5} />
                </div>
                <div className="text-gray-600 font-medium">Năm kinh nghiệm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                             <div className={`transition-opacity duration-700 ${isVisible ? "opacity-100 slide-in-left" : "opacity-0"}`}>
                 <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                   Câu chuyện của chúng tôi
                 </h2>
                 <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                   VieTour được thành lập với mong muốn đem đến sàn du lịch cung cấp các tour du lịch 
                   chất lượng từ nhiều nhà cung cấp uy tín. Chúng tôi tin rằng mỗi chuyến đi đều là một 
                   cơ hội để khám phá, học hỏi và tạo ra những kỷ niệm đáng nhớ.
                 </p>
                 <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                   Là nền tảng kết nối giữa khách hàng và các đối tác du lịch chất lượng, chúng tôi 
                   cam kết mang đến sự đa dạng trong lựa chọn với mức giá cạnh tranh, đảm bảo mọi 
                   khách hàng đều có được trải nghiệm du lịch hoàn hảo từ những nhà cung cấp được 
                   kiểm định chất lượng.
                 </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Chứng nhận ISO 9001</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    <span>Chất lượng tuyệt đối</span>
                  </div>
                </div>
              </div>
              <div className={`transition-opacity duration-700 ${isVisible ? "opacity-100 slide-in-right" : "opacity-0"}`}>
                <div className="relative">
                  <div className="w-full h-96 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-2xl float"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-2xl"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="w-32 h-32 text-white opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className={`text-center mb-16 transition-opacity duration-700 ${isVisible ? "opacity-100 fade-in-up-delay-2" : "opacity-0"}`}>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Tại sao chọn VieTour?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Chúng tôi tự hào mang đến những giá trị vượt trội cho mọi chuyến đi của bạn
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Trải nghiệm tuyệt vời</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cam kết mang đến những trải nghiệm du lịch đáng nhớ và khó quên, 
                  với các hoạt động thú vị và địa điểm độc đáo.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Dịch vụ chất lượng</h3>
                <p className="text-gray-600 leading-relaxed">
                  Đội ngũ chuyên nghiệp, tận tâm phục vụ khách hàng 24/7, 
                  đảm bảo mọi nhu cầu của bạn được đáp ứng hoàn hảo.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Giá cả hợp lý</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cung cấp dịch vụ chất lượng cao với mức giá cạnh tranh nhất, 
                  phù hợp với mọi ngân sách du lịch.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Chứng nhận uy tín</h3>
                <p className="text-gray-600 leading-relaxed">
                  Được chứng nhận bởi các tổ chức du lịch quốc tế, 
                  đảm bảo chất lượng dịch vụ đạt tiêu chuẩn cao nhất.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">An toàn tuyệt đối</h3>
                <p className="text-gray-600 leading-relaxed">
                  Đảm bảo an toàn cho mọi chuyến đi của bạn với các biện pháp 
                  bảo vệ toàn diện và bảo hiểm du lịch đầy đủ.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Hỗ trợ 24/7</h3>
                <p className="text-gray-600 leading-relaxed">
                  Đội ngũ hỗ trợ khách hàng luôn sẵn sàng phục vụ 24/7, 
                  giải đáp mọi thắc mắc và hỗ trợ khẩn cấp khi cần.
                </p>
              </div>
            </div>
          </div>
        </div>        
      </div>
    </>
  );
}