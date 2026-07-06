import api from './axiosInstance';

export const authService = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  logout: () => api.post('/user/logout'),
  searchUsers: (query) => api.get(`/user/search?query=${query}`),
  updateSettings: (data) => api.patch('/user/settings', data),
  getCurrentUser: () => api.get('/user/me'),
};

export const groupService = {
  createGroup: (data) => api.post('/group', data),
  getGroupDashboard: () => api.get('/group/user-groups'),
  getGroupActivity: (groupId) => api.get(`/group/${groupId}/activity`),
  simplifyDebts: (groupId) => api.post(`/group/${groupId}/simplify`),
  getGroupDetails: (groupId) => api.get(`/group/${groupId}`),
  deleteGroup: (groupId) => api.delete(`/group/${groupId}`),
};

export const expenseService = {
  createExpense: (data) => api.post('/expense', data),
  deleteExpense: (expenseId) => api.delete(`/expense/${expenseId}`),
  settleUp: (data) => api.post('/expense/settle', data),
  getUserExpenses: () => api.get('/expense'),
};

export const notificationService = {
  getNotifications: () => api.get('/notification'),
  markAsRead: (notificationId) => api.put(`/notification/${notificationId}/read`),
};
