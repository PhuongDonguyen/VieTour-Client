import axiosInstance from './axiosInstance';

export const getResources = () =>
  axiosInstance.get('/api/resources');

export const getResourceById = (id: number) =>
  axiosInstance.get(`/api/resources/${id}`);