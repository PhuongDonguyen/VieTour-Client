import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchBlogBySlug } from "../services/blog.service";
import Skeleton from 'react-loading-skeleton';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const blogData = await fetchBlogBySlug(slug);
        setBlog(blogData);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 py-12 px-4 monserrat">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-9/12">
            <Skeleton height={40} width={300} style={{ marginBottom: 24, marginTop: 64 }} />
            <Skeleton height={384} className="mb-6" />
            <Skeleton count={8} height={20} style={{ marginBottom: 8 }} />
          </div>
          <div className="w-full lg:w-3/12">
            <Skeleton height={200} />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) return <div className="text-center py-20 text-red-500">Không tìm thấy blog.</div>;

  return (
    <div className="flex-1 bg-gray-50 py-12 px-4 monserrat">
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
  );
};

export default BlogDetail; 