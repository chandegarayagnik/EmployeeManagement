import { apiRequest } from './api.js';

export const EmployeeModule = {
  async getEmployees(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });

    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/emp/getemp${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, { method: 'GET' });
  },

  async getEmployeeById(id) {
    return await apiRequest(`/emp/getbyempid/${id}`, { method: 'GET' });
  },

  async saveEmployee(formData) {
    // Send FormData to POST /api/emp/AddEmp
    return await apiRequest('/emp/AddEmp', {
      method: 'POST',
      body: formData
    });
  },

  async deleteEmployee(id) {
    return await apiRequest(`/emp/empdelete/${id}`, { method: 'DELETE' });
  },

  getPhotoUrl(photoFileName) {
    if (!photoFileName) return null;
    if (photoFileName.startsWith('http')) return photoFileName;
    return `/media/${photoFileName}`;
  }
};
