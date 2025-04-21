import axios from 'axios';

const client = axios.create({ baseURL: '/api/v1', withCredentials: true });

export const getBinStatus = (branchId) =>
  client.get(`/binDashboardAnalytics/binStatus?branchId=${branchId}`);

export const getLatestBinWeight = (binId) =>
  client.get(`/binDashboardAnalytics/latestBinWeight?binId=${binId}`);
