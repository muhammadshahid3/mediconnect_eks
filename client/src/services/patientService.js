import api from './api';

export const getPatientProfile = () => api.get('/patients/profile');
export const updatePatientProfile = (data) => api.put('/patients/profile', data);
