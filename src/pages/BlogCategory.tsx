import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllCategories } from "../services/blogCategory.service";
import { fetchBlogs } from "../services/blog.service";
import { Loading } from "../components/Loading";
import { BlogCard } from "../components/BlogCard";
import { Home, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

const BlogCategory: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [category, setCategory] = useState<any>(null);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async (page: number = 1) => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const categories = await getAllCategories({ slug });
            const cat = categories[0]; // Get the first (and should be only) category with this slug
            if (!cat) {
                throw new Error('Không tìm thấy danh mục');
            }
            setCategory(cat);
            const res = await fetchBlogs({ category_id: cat.id, status: 'published', limit: 9, page });
            console.log(res);
            setBlogs(res.data || []);
            setPagination(res.pagination);
        } catch (err) {
            setError('Không tìm thấy danh mục hoặc bài viết.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [slug, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        if (!pagination) return [];
        
        const totalPages = pagination.totalPages;
        const current = pagination.page;
        const pages = [];
        
        if (totalPages <= 7) {
            // Show all pages if total is 7 or less
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            if (current > 3) {
                pages.push('ellipsis-start');
            }
            
            // Show pages around current page
            const start = Math.max(2, current - 1);
            const end = Math.min(totalPages - 1, current + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (current < totalPages - 2) {
                pages.push('ellipsis-end');
            }
            
            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl container mx-auto px-4 py-8 mt-20">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                <Link 
                    to="/" 
                    className="flex items-center hover:text-orange-600 transition-colors duration-200"
                >
                    <Home className="w-4 h-4 mr-1" />
                    <span>Trang chủ</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                    {category?.title}
                </span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-bold text-[#015294] mb-8 text-center">
                {category?.title}
            </h1>
            
            {loading ? (
                <Loading />
            ) : blogs.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map(blog => (
                            <BlogCard
                                key={blog.id}
                                id={blog.id}
                                title={blog.title}
                                excerpt={blog.excerpt}
                                thumbnail={blog.thumbnail}
                                author={blog.author?.name || blog.author_name}
                                publishedAt={blog.published_at || blog.created_at}
                                readTime={blog.read_time}
                                views={blog.view_count}
                                slug={blog.slug}
                            />
                        ))}
                    </div>
                    
                    {/* Shadcn Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-28">
                            <Pagination>
                                <PaginationContent>
                                    {/* Previous Button */}
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            href="#"
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault();
                                                if (pagination.hasPrevPage) {
                                                    handlePageChange(currentPage - 1);
                                                }
                                            }}
                                            className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    
                                    {/* Page Numbers */}
                                    {generatePageNumbers().map((page, index) => (
                                        <PaginationItem key={index}>
                                            {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.preventDefault();
                                                        handlePageChange(page as number);
                                                    }}
                                                    isActive={page === currentPage}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}
                                    
                                    {/* Next Button */}
                                    <PaginationItem>
                                        <PaginationNext 
                                            href="#"
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault();
                                                if (pagination.hasNextPage) {
                                                    handlePageChange(currentPage + 1);
                                                }
                                            }}
                                            className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Chưa có bài viết nào cho danh mục này.</p>
                </div>
            )}
        </div>
    );
};

export default BlogCategory; 