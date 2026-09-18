import api from './api';

export const adminService = {
  // Get dashboard metrics counters and recent reports
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get visual charts analytics (waste breakdown, hotspots, monthly volume)
  getAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },


  // Get user directory with optional role filter
  getUsers: async (role = '') => {
    const response = await api.get('/admin/users', {
      params: role ? { role } : {}
    });
    return response.data;
  },

  // Get cleaning staff with active task counts
  getStaffRoster: async () => {
    const response = await api.get('/admin/staff');
    return response.data;
  },

  // Get filtered reports registry
  getReports: async (filters = {}) => {
    const response = await api.get('/admin/reports', { params: filters });
    return response.data;
  },

  // Dispatch a task to a cleaning staff member
  assignReport: async (reportId, staffId, adminNotes = '') => {
    const response = await api.post('/admin/assign', {
      reportId,
      staffId,
      adminNotes
    });
    return response.data;
  },

  // Update report priority level
  updatePriority: async (reportId, priority) => {
    const response = await api.patch(`/admin/reports/${reportId}/priority`, { priority });
    return response.data;
  },

  // Override report lifecycle status
  updateStatus: async (reportId, status) => {
    const response = await api.patch(`/admin/reports/${reportId}/status`, { status });
    return response.data;
  }
};
