import axios from 'axios';
const client = axios.create({ baseURL: '/api/v1', withCredentials: true });

export const getMinimalOverview = (branchId) =>
  client.get(`/binDashboardAnalytics/minimalOverview?branchId=${branchId}`);

export const getDiversionRate = (branchId) =>
  client.get(`/binDashboardAnalytics/diversionRate?branchId=${branchId}`);

export const getWasteLast7Days = (branchId) =>
  client.get(`/binDashboardAnalytics/wasteLast7Days?branchId=${branchId}`);

export const getWasteTrendComparison = (branchId) =>
  client.get(`/binDashboardAnalytics/wasteTrendComparison?branchId=${branchId}`);
