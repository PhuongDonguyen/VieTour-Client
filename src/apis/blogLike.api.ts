import axiosInstance from "./axiosInstance";

export const toggleBlogLike = async (blog_id: number) => {
  try {
    const response = await axiosInstance.post("/api/blog-likes/toggle", { blog_id });
    return response;
  } catch (error) {
    console.error("Error in toggleBlogLike:", error);
    throw error;
  }
};

