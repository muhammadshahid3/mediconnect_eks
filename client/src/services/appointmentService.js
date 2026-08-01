import api from './api';

export const bookAppointment = (data) => api.post('/appointments', data);
export const getPatientAppointments = () => api.get('/appointments/patient');
export const getDoctorAppointments = () => api.get('/appointments/doctor');
export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}/status`, { status });
