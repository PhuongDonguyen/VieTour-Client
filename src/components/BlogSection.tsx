import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { fetchBlogCategories } from "../services/blogCategory.service";
import { fetchBlogs } from "../services/blog.service";

const BlogSection: React.FC = () => {
  const [blogCategories, setBlogCategories] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const catRes = await fetchBlogCategories();
      if (catRes && catRes.success) setBlogCategories(catRes.data);
      const blogRes = await fetchBlogs();
      if (blogRes && blogRes.success) setBlogs(blogRes.data);
    };
    fetchData();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-blue-900">BLOG</h2>
      {/* Blog Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {blogCategories.map((cat) => (
          <a
            key={cat.id}
            href={`/blog-category/${cat.id}`}
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
              {/* Adjusted dark overlay with lower opacity */}
              {/* <div className="absolute inset-0 bg-black bg-opacity-25 z-0"></div> */}
              <div className="relative z-10 p-6 text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-2xl">{cat.title}</h3>
                <p className="text-sm md:text-base mb-3 drop-shadow-2xl line-clamp-2">{cat.desc}</p>
              </div>
            </div>
          </a>
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
          loop={true}
          className="px-2 py-4"
        >
          {blogs.map((blog) => (
            <SwiperSlide key={blog.id}>
              <a
                href={`/blog/${blog.id}`}
                className="block group h-full"
                tabIndex={0}
                aria-label={blog.title}
                style={{ textDecoration: 'none' }}
              >
                <div className="bg-white rounded-lg overflow-hidden transition-shadow duration-300 h-full flex flex-col group-hover:shadow-xl group-focus:shadow-xl">
                  <img 
                    src={blog.thumbnail} 
                    alt={blog.title} 
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="p-4 flex-grow">
                    <h4 className="font-bold text-base mb-2 text-blue-900 line-clamp-2">
                      {blog.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                      {blog.content}
                    </p>
                  </div>
                  <div className="px-4 pb-4">
                    <span className="text-sm text-blue-600 font-medium group-hover:text-blue-800 group-focus:text-blue-800 transition">
                      Đọc tiếp →
                    </span>
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