import { apiRequest } from './api.js';

export const DepartmentModule = {
  async getDepartments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/depart/getdepart${queryString ? `?${queryString}` : ''}`;
    return await apiRequest(endpoint, { method: 'GET' });
  },

  async addOrUpdateDepartment(deptData) {
    return await apiRequest('/depart/AddAndUpdateDepart', {
      method: 'POST',
      body: JSON.stringify(deptData)
    });
  },

  async deleteDepartment(departmentId) {
    return await apiRequest(`/depart/deletedepart/${departmentId}`, {
      method: 'DELETE'
    });
  },

  async populateDepartmentDropdown(selectElementId, selectedId = null) {
    const selectEl = document.getElementById(selectElementId);
    if (!selectEl) return;

    try {
      const response = await this.getDepartments();
      const departments = response.data || [];

      selectEl.innerHTML = '<option value="">-- Select Department --</option>';
      departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.DepartmentID || dept.Id || dept.DepartmentId;
        option.textContent = dept.DepartmentName || `Department #${option.value}`;
        if (selectedId && String(option.value) === String(selectedId)) {
          option.selected = true;
        }
        selectEl.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to populate department dropdown:", err);
    }
  }
};
