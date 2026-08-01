import api from './api';

export const getDoctors = (params) => api.get('/doctors', { params });
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const getMyDoctorProfile = () => api.get('/doctors/profile/me');

export const updateDoctorProfile = (formData) =>
  api.put('/doctors/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
