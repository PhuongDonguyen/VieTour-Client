import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { getAllCategories } from "../services/blogCategory.service";
import { fetchBlogs } from "../services/blog.service";
import { SkeletonBlogSection } from "./Skeleton";
import { ImageSize, ImageQuality, transformCloudinaryUrl } from "../utils/imageUtils";

const BlogSection: React.FC = () => {
  const [blogCategories, setBlogCategories] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const catRes = await getAllCategories();
        console.log("Blog Categories: ", catRes);
        // Limit to maximum 4 categories
        setBlogCategories(catRes.slice(0, 4));
        const blogRes = await fetchBlogs();
        setBlogs(blogRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog data:', error);
        setError('Không thể tải dữ liệu blog');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <SkeletonBlogSection />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#015294] mb-4">BLOG</h2>
        <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
      </div>

      {/* Blog Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {blogCategories.map((cat, index) => (
          <div key={cat.id}>
            <a
              href={`/blog-category/${cat.slug}`}
              className="block group"
              tabIndex={0}
              aria-label={cat.title}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="relative rounded-lg overflow-hidden shadow-lg h-80 md:h-90 flex flex-col justify-end transition-transform duration-300 group-hover:scale-[1.02] group-focus:scale-[1.02]"
                style={{
                  backgroundImage: `url(${cat.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 z-0"></div>
                <div className="relative z-10 p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-lg">{cat.title}</h3>
                  <p className="text-sm md:text-base mb-3 drop-shadow-lg line-clamp-2">{cat.desc}</p>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Blogs Carousel with Swiper */}
      <div className="relative">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={blogs.length > 3}
          className="px-2 py-4"
        >
          {blogs && blogs.map((blog) => (
            <SwiperSlide key={blog.id}>
              <a
                href={`/blog/${blog.slug}`}
                className="block group h-full"
                tabIndex={0}
                aria-label={blog.title}
                style={{ textDecoration: 'none' }}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col group-hover:shadow-2xl group-hover:-translate-y-1 group-focus:shadow-2xl group-focus:-translate-y-1">
                  {/* Blog image with overlay */}
                  <div className="relative overflow-hidden">
                    <img
                      src={transformCloudinaryUrl(blog.thumbnail, ImageSize.THUMBNAIL, ImageQuality.HIGH, 'f_auto')}
                      alt={blog.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Enhanced gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h4 className="font-bold text-lg mb-3 text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                    <div className="mt-auto pt-2">
                      <span className="inline-flex items-center text-sm text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                        Đọc tiếp
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default BlogSection;