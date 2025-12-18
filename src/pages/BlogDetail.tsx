import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBlogs, fetchUserBlogs } from "../services/blog.service";
import { getBlogCategoryById, BlogCategory } from "../apis/blogCategory.api";
import { toggleBlogLike } from "../apis/blogLike.api";
import { toggleBlogBookmark as toggleBlogBookmarkService } from "../services/bookmark.service";
import RecentlyViewedTours from "../components/RecentlyViewedTours";
import { ImageSize, ImageQuality, transformCloudinaryUrl } from "../utils/imageUtils";

import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Heart,
  Bookmark,
  ArrowLeft,
  Facebook,
  Twitter,
  Link as LinkIcon,
  ChevronUp,
  Home,
  ChevronRight
} from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

const BlogDetail: React.FC = () => {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Capture current URL for sharing; guard for non-browser environments
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, [slug]);

  useEffect(() => {
    console.log({ slug });
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use fetchUserBlogs if user exists and role is "user", otherwise use fetchBlogs
        const shouldUseUserBlogs = user && user.role === "user";
        // const response = shouldUseUserBlogs
        //   ? await fetchUserBlogs({ slug: slug })
        //   : await fetchBlogs({ slug: slug });
        const response = await fetchBlogs({slug: slug, status: "published"});
        console.log("response: ", response);  
        // Since we're fetching by slug, we expect only one blog
        const blogData = response.data && response.data.length > 0 ? response.data[0] : null;
        setBlog(blogData);
        console.log("blogData like: ", blogData?.is_liked);
        setIsLiked(blogData?.is_liked || false);
        setIsBookmarked(blogData?.is_bookmarked || false);
        // Initialize like count from blog data
        if (blogData) {
          setLikeCount(blogData.like_count || 0);
        }
        
        // Fetch category information if blog has category_id
        setLoading(false);

        // Fetch category information if blog has category_id (separate loading)
        if (blogData && blogData.category_id) {
          setLoadingCategory(true);
          try {
            const categoryResponse = await getBlogCategoryById(blogData.category_id);
            setCategory(categoryResponse.data);
          } catch (categoryError) {
            console.error('Error fetching blog category:', categoryError);
            setCategory(null);
          } finally {
            setLoadingCategory(false);
          }
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setBlog(null);
        setCategory(null);
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, user]);

  useEffect(() => {
    console.log("isLiked: ", isLiked);
  }, [isLiked]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateReadingTime = (content: string) => {
    if (!content) return "1 min read";

    // Remove HTML tags to get plain text
    const plainText = content.replace(/<[^>]*>/g, '');

    // Count words (split by spaces)
      const words = plainText
        .trim()
        .split(/\s+/).length;

    // Average reading speed: 200 words per minute
    const minutes = Math.ceil(words / 200);

    return `${Math.max(1, minutes)} min read`;
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu bài viết.");
      return;
    }

    if (!blog || !blog.id || isBookmarking) return;

    const previousIsBookmarked = isBookmarked;

    // Optimistic update
    setIsBookmarked(!isBookmarked);
    setIsBookmarking(true);

    try {
      await toggleBlogBookmarkService(blog.id);
    } catch (error) {
      // Revert optimistic update on error
      setIsBookmarked(previousIsBookmarked);
      console.error("Error toggling blog bookmark:", error);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bài viết.");
      return;
    }

    if (!blog || !blog.id || isLiking) return;

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1);
    setIsLiking(true);

    try {
      await toggleBlogLike(blog.id);
      // If API returns updated like count, you can update it here
      // const response = await toggleBlogLike(blog.id);
      // if (response?.data?.like_count !== undefined) {
      //   setLikeCount(response.data.like_count);
      //   setIsLiked(response.data.is_liked);
      // }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      console.error("Error toggling blog like:", error);
      // You can add a toast notification here if needed
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (platform: "facebook" | "twitter" | "link") => {
    if (!shareUrl) return;

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(blog?.title || "");

    try {
      if (platform === "facebook") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else if (platform === "twitter") {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else if (platform === "link") {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Đã sao chép liên kết!");
        } else {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          toast.success("Đã sao chép liên kết!");
        }
      }
    } catch (error) {
      console.error("Error sharing blog:", error);
      toast.error("Không thể chia sẻ, vui lòng thử lại.");
    } finally {
      setShowShareMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 monserrat">
        <div className="mt-20 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb skeleton */}
          <Skeleton height={20} width={200} style={{ marginBottom: 24 }} />

          {/* Main content layout */}
          <div className="flex flex-col lg:flex-row gap-8 mt-10">
            {/* Main article skeleton */}
            <div className="lg:w-[75%]">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Hero image skeleton */}
                <Skeleton height={384} className="mb-0" />

                {/* Article content skeleton */}
                <div className="p-6">
                  {/* Title skeleton */}
                  <Skeleton height={32} className="mb-4" />
                  <Skeleton height={24} width="80%" className="mb-6" />

                  {/* Meta info skeleton */}
                  <div className="flex space-x-4 mb-6">
                    <Skeleton height={20} width={100} />
                    <Skeleton height={20} width={80} />
                    <Skeleton height={20} width={60} />
                  </div>

                  {/* Content skeleton */}
                  <Skeleton
                    count={8}
                    height={20}
                    style={{ marginBottom: 8 }}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:w-[25%]">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Header skeleton */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 border-b border-gray-100">
                  <Skeleton height={20} width={120} />
                </div>

                {/* Tours list skeleton */}
                <div className="divide-y divide-gray-50">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start space-x-3">
                        <Skeleton
                          height={56}
                          width={56}
                          className="rounded-lg"
                        />
                        <div className="flex-1">
                          <Skeleton height={16} className="mb-2" />
                          <Skeleton
                            height={14}
                            width="60%"
                            className="mb-1"
                          />
                          <div className="flex justify-between">
                            <Skeleton height={12} width={80} />
                            <Skeleton height={12} width={60} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog && !loading)
    return (
      <div className="text-center py-20 text-red-500">
        Không tìm thấy blog.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 monserrat">
      <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {blog ? (
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link
              to="/"
              className="flex items-center hover:text-orange-600 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-1" />
              <span>Trang chủ</span>
            </Link>
            {loadingCategory ? (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Skeleton width={100} height={16} />
              </>
            ) : category ? (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link
                  to={`/blog-category/${category.slug}`}
                  className="hover:text-orange-600 transition-colors duration-200"
                >
                  {category.title}
                </Link>
              </>
            ) : null}
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {blog.title}
            </span>
          </nav>
        ) : (
          <Skeleton height={20} width={200} style={{ marginBottom: 24 }} />
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 mt-10">
          {/* Main Article Content */}
          <div className="lg:w-[75%]">
            {/* Article Header */}
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Hero Image */}
              {blog.thumbnail && (
                <div className="relative h-96">
                  <img
                    src={transformCloudinaryUrl(blog.thumbnail, ImageSize.CARD, ImageQuality.HIGH, 'f_auto')}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{blog.title}</h1>
                    {blog.excerpt && (
                      <p className="text-lg text-white/90">{blog.excerpt}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Article Meta */}
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {blog.author?.[0] || "A"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {blog.author || "Anonymous"}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {blog.created_at &&
                            new Date(blog.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {(() => {
                            // Simple reading time calculation for browser
                            const content = blog.content || "";
                            // Remove HTML tags for accurate word count
                            const textContent = content.replace(/<[^>]*>/g, "");
                            const words = textContent.trim().split(/\s+/).length;
                            const wordsPerMinute = 200;
                            const minutes = Math.ceil(
                              words / wordsPerMinute
                            );
                            return `${Math.max(1, minutes)} min read`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleLike}
                      disabled={isLiking}
                      className={`flex items-center px-3 py-2 border rounded-md text-sm transition-colors ${
                        isLiked
                          ? "text-red-600 border-red-200"
                          : "text-gray-600 border-gray-300 hover:border-gray-400"
                      } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${
                          isLiked ? "fill-red-600" : ""
                        }`}
                      />
                      {likeCount}
                    </button>
                    <button
                      onClick={handleToggleBookmark}
                      disabled={isBookmarking}
                      className={`flex items-center px-3 py-2 border rounded-md text-sm transition-colors ${
                        isBookmarked
                          ? "text-blue-600 border-blue-200"
                          : "text-gray-600 border-gray-300 hover:border-gray-400"
                      } ${isBookmarking ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Bookmark
                        className={`h-4 w-4 mr-2 ${
                          isBookmarked ? "fill-blue-600" : ""
                        }`}
                      />
                      Save
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </button>
                      {showShareMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-2 z-10">
                          <div className="flex space-x-2">
                            <button
                              className="p-2 hover:bg-gray-100 rounded"
                              onClick={() => handleShare("facebook")}
                            >
                              <Facebook className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              className="p-2 hover:bg-gray-100 rounded"
                              onClick={() => handleShare("twitter")}
                            >
                              <Twitter className="h-4 w-4 text-blue-400" />
                            </button>
                            <button
                              className="p-2 hover:bg-gray-100 rounded"
                              onClick={() => handleShare("link")}
                            >
                              <LinkIcon className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <div className="max-w-none">
                  <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:w-[25%] min-w-[250px]">
            <div className="sticky top-24 space-y-6">
              {!loading && (
                <RecentlyViewedTours
                  maxItems={5}
                  title="Đã xem gần gần đây"
                />
              )}
            </div>
          </div>
          
        </div>

        {/* Comments Section */}
        {/* {<div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Comments (0)</h3>
          </div> */}

        {/* Add Comment Form */}
        {/* <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Join the conversation</h4>
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this article..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Be respectful and constructive in your comments</p>
                <button
                  onClick={() => {
                    if (newComment.trim()) {
                      // Handle comment submission
                      setNewComment("");
                    }
                  }}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div> */}
      </div>

      {/* Newsletter Signup */}
      {/* <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Never Miss Our Latest Travel Tips</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest destination guides, travel tips, and exclusive offers
            delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">Join 15,000+ travelers who trust our insights</p>
        </div>
      </div> */}

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default BlogDetail; 