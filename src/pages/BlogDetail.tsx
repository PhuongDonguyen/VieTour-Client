import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchBlogs } from "../services/blog.service";
import { NavBar } from "../layouts/NavBar";
import { Footer } from "../layouts/Footer";
import { TopBar } from "@/layouts/TopBar";

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetchBlogs();
      if (res && res.success && Array.isArray(res.data)) {
        const found = res.data.find((b: any) => String(b.id) === String(id));
        setBlog(found);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!blog) return <div className="text-center py-20 text-red-500">Không tìm thấy blog.</div>;

  return (
    <div className="min-h-screen flex flex-col monserrat">
      <TopBar />
      <NavBar textDark={true} />
      <div className="flex-1 bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-9/12">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900 mt-16">{blog.title}</h1>
            {blog.thumbnail && (
              <img src={blog.thumbnail} alt={blog.title} className="w-full rounded-lg mb-6 object-cover max-h-96" />
            )}
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
          <div className="w-full lg:w-3/12">
            {/* Add your right-side component here */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail; 