import api from './api';

export const reportService = {
  // Fetch dropdown metadata (campus zones, buildings, waste categories)
  getMetadata: async () => {
    const response = await api.get('/reports/meta/options');
    return response.data;
  },

  // Submit a new waste incident report with photo
  createReport: async (formData) => {
    // formData must be instance of FormData containing: image (file), locationId, categoryId, priority, description
    const response = await api.post('/reports', formData);
    return response.data;
  },

  // AI Waste Classification from uploaded photo
  classifyImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post('/reports/classify', formData);
    return response.data;
  },

  // Get all reports submitted by the logged-in student
  getMyReports: async () => {
    const response = await api.get('/reports/my-reports');
    return response.data;
  },

  // Get single report details with before/after photos
  getReportById: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },

  // Delete a report when authorized
  deleteReport: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  }
};
