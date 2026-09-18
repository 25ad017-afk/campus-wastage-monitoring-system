import api from './api';

export const staffService = {
  // Get active tasks feed
  getTasks: async (status = '') => {
    const response = await api.get('/staff/tasks', {
      params: status ? { status } : {}
    });
    return response.data;
  },

  // Get details of an assigned task
  getTaskDetails: async (assignmentId) => {
    const response = await api.get(`/staff/tasks/${assignmentId}`);
    return response.data;
  },

  // Accept/Acknowledge an assignment
  acceptTask: async (assignmentId) => {
    const response = await api.patch(`/staff/tasks/${assignmentId}/accept`);
    return response.data;
  },

  // Mark work as IN_PROGRESS
  startTask: async (assignmentId) => {
    const response = await api.patch(`/staff/tasks/${assignmentId}/start`);
    return response.data;
  },

  // Complete cleanup with "After" proof image
  completeTask: async (assignmentId, formData) => {
    // formData must be instance of FormData containing: image (file), remarks, wasteWeightKg, disposalDestination
    const response = await api.post(`/staff/tasks/${assignmentId}/complete`, formData);
    return response.data;
  },

  // Get historical completed tasks
  getHistory: async () => {
    const response = await api.get('/staff/history');
    return response.data;
  },

  // Toggle availability status (true/false)
  toggleAvailability: async (isAvailable) => {
    const response = await api.patch('/staff/availability', { isAvailable });
    return response.data;
  }
};
