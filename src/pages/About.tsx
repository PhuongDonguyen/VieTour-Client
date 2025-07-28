import { useEffect, useState } from "react";
import { resourcesService } from "../services/resources.service";

export default function About() {
  const [introduce, setIntroduce] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourcesService.fetchResources().then((data) => {
      const intro = data.find((item) => item.key === "introduce");
      setIntroduce(intro ? intro.content : "");
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-16 px-4 min-h-[60vh] mt-10">
      <h1 className="text-3xl md:text-4xl font-bold text-[#015294] mb-8 text-start">
        Về chúng tôi
      </h1>
        {loading ? (
          <div className="text-center text-gray-500">Đang tải...</div>
        ) : (
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: introduce }} />
        )}
      </div>
    </div>
  );
} 