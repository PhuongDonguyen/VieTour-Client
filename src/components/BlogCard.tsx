import React from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {thumbnail && (
        <div className="relative">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
          <Link to={`/blog/${id}`}>
            {title}
          </Link>
        </h3>
        
        {excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3" 
             dangerouslySetInnerHTML={{ __html: excerpt }} />
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {author && (
              <span className="flex items-center">
                <span className="mr-1">By</span>
                <span className="font-medium">{author}</span>
              </span>
            )}
            {publishedAt && (
              <span>{new Date(publishedAt).toLocaleDateString('vi-VN')}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {readTime && (
              <span className="flex items-center">
                <span className="mr-1">📖</span>
                {readTime}
              </span>
            )}
            {views && (
              <span className="flex items-center">
                <span className="mr-1">👁️</span>
                {views.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <Link
            to={`/blog/${id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            Đọc tiếp
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}; 