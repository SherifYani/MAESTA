import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

const ApiService = {
  // Test connection
  testConnection: () => apiClient.get('/home'),

  // Add your API methods here
  // Example:
  // getJobs: () => apiClient.get('/jobs'),
  // createJob: (jobData) => apiClient.post('/jobs', jobData),
  // updateJob: (id, jobData) => apiClient.put(`/jobs/${id}`, jobData),
  // deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
};

export default ApiService;
