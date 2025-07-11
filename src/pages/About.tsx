import { useEffect, useState } from "react";
import { resourcesService } from "../service/resources.service";
import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import { Footer } from "../components/Footer";

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
      <TopBar />
      <NavBar />
      <div className="max-w-3xl mx-auto py-16 px-4 min-h-[60vh]">
        {loading ? (
          <div className="text-center text-gray-500">Đang tải...</div>
        ) : (
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: introduce }} />
        )}
      </div>
      <Footer />
    </div>
  );
} 