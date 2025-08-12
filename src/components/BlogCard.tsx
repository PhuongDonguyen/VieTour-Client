import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye, User, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  id: number;
  title: string;
  excerpt?: string;
  thumbnail?: string;
  author?: string;
  publishedAt?: string;
  readTime?: string;
  views?: number;
  slug?: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  excerpt,
  thumbnail,
  author,
  publishedAt,
  readTime,
  views,
  slug
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateReadTime = (text: string) => {
    if (readTime) return readTime;
    const words = text?.replace(/<[^>]*>/g, '').split(' ').length || 0;
    const minutes = Math.ceil(words / 200);
    return `${minutes} phút đọc`;
  };

  return (
    <article className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <Link to={`/blog/${slug || id}`}>
          <div className="aspect-[16/10] bg-gradient-to-br from-orange-100 to-red-100">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-orange-300 text-6xl">📖</div>
              </div>
            )}
          </div>
        </Link>
        
        {/* Enhanced overlay for better text readability - always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
        
        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
          <Link to={`/blog/${slug || id}`} className="line-clamp-2">
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p 
            className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            {author && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="font-medium">{author}</span>
              </div>
            )}
            {publishedAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(publishedAt)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{calculateReadTime(excerpt || '')}</span>
            </div>
            {views && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{views.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Read More Button */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            to={`/blog/${slug || id}`}
            className="inline-flex items-center text-orange-600 font-semibold text-sm group/link"
          >
            <span>Đọc tiếp</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </article>
  );
}; 