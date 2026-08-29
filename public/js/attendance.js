import { apiRequest } from './api.js';

export const AttendanceModule = {
  async getAttendance(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });

    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/attendance/getattendance${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, { method: 'GET' });
  },

  async addOrUpdateAttendance(data) {
    return await apiRequest('/attendance/addandupdateattendance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteAttendance(id) {
    return await apiRequest(`/attendance/deleteattendance/${id}`, {
      method: 'DELETE'
    });
  }
};
