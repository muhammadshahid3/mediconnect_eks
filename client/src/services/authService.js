import api from './api';

export const doctorSignup = (data) => api.post('/doctors/signup', data);
export const doctorLogin = (data) => api.post('/doctors/login', data);

export const patientSignup = (data) => api.post('/patients/signup', data);
export const patientLogin = (data) => api.post('/patients/login', data);
