import axiosInstance from './axiosInstance';

export const getTourBySlug = (slug: string) =>
  axiosInstance.get(`/api/tours?slug=${slug}`);

export const getTourDetail = (tour_id: number) =>
  axiosInstance.get(`/api/tour_details?tour_id=${tour_id}`);

export const getTourImages = (tour_id: number) =>
  axiosInstance.get(`/api/tour_images?tour_id=${tour_id}`);

export const getTopBookedTours = (limit: number) =>
  axiosInstance.get(`/api/tours/top-booked?limit=${limit}`); 

export const getTours = (page: number, limit: number) => 
  axiosInstance.get(`/api/tours?page=${page}&limit=${limit}&is_active=true`);

export const getToursByCatId = (catId: number) => 
  axiosInstance.get(`/api/tours?tour_category_id=${catId}`);

export const getToursByIsActive = ( active:boolean) => 
    axiosInstance.get(`/api/tours?is_active=${active}`);

export const getTourById = (id: number) =>
  axiosInstance.get(`/api/tours/${id}`)