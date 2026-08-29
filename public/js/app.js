import { AuthStorage } from './api.js';
import { AuthModule } from './auth.js';
import { EmployeeModule } from './employee.js';
import { DepartmentModule } from './department.js';
import { AttendanceModule } from './attendance.js';

// Global Application State
const AppState = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
  searchTerm: '',
  departmentFilter: '',
  statusFilter: '',
  activeTab: 'dashboard',
  selectedEmployeeForDelete: null
};

// UI Utilities - Toast Notifications
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  
  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <div style="flex:1;">${message}</div>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:white; cursor:pointer;">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global modal helpers with History Back Button protection
const openModalStack = [];

window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    const body = modal.querySelector('.modal-body');
    if (body) body.scrollTo({ top: 0, behavior: 'smooth' });

    if (!openModalStack.includes(modalId)) {
      openModalStack.push(modalId);
      history.pushState({ modalId: modalId }, '', `#${modalId}`);
    }
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    const index = openModalStack.indexOf(modalId);
    if (index !== -1) {
      openModalStack.splice(index, 1);
      if (window.location.hash === `#${modalId}`) {
        history.back();
      }
    }
  }
};

// Handle Browser Back / Mobile Back Gesture
window.addEventListener('popstate', (e) => {
  if (openModalStack.length > 0) {
    const lastModalId = openModalStack.pop();
    const modal = document.getElementById(lastModalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }
});

// Full Page Image Lightbox Preview Handler
window.openImageLightbox = function(src, title = 'Employee Photo Preview') {
  if (!src) return;
  const imgEl = document.getElementById('lightbox-image-src');
  const titleEl = document.getElementById('lightbox-image-title');
  if (imgEl) imgEl.src = src;
  if (titleEl) titleEl.textContent = title;
  window.openModal('modal-image-lightbox');
};

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  initNavigation();
  initEmployeeEvents();
  initDepartmentEvents();
  initAttendanceEvents();
  checkAuthAndRender();
});

let currentLoginRole = 'Admin';

// Auth UI handling
function initAuthUI() {
  const loginTabBtn = document.getElementById('btn-show-login');
  const signupTabBtn = document.getElementById('btn-show-signup');
  const loginForm = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');

  const btnRoleAdmin = document.getElementById('btn-role-mode-admin');
  const btnRoleUser = document.getElementById('btn-role-mode-user');
  const titleEl = document.getElementById('login-role-title');
  const subEl = document.getElementById('login-role-subtitle');
  const toggleLoginPassBtn = document.getElementById('btn-toggle-login-pass');

  if (btnRoleAdmin && btnRoleUser) {
    btnRoleAdmin.addEventListener('click', () => {
      currentLoginRole = 'Admin';
      btnRoleAdmin.style.background = 'var(--accent-primary, #0d9488)';
      btnRoleAdmin.style.color = 'white';
      btnRoleUser.style.background = 'transparent';
      btnRoleUser.style.color = 'var(--text-muted)';
      if (titleEl) titleEl.textContent = 'Admin Login';
      if (subEl) subEl.textContent = 'Please enter your credentials to login as Admin.';
    });

    btnRoleUser.addEventListener('click', () => {
      currentLoginRole = 'User';
      btnRoleUser.style.background = 'var(--accent-primary, #0d9488)';
      btnRoleUser.style.color = 'white';
      btnRoleAdmin.style.background = 'transparent';
      btnRoleAdmin.style.color = 'var(--text-muted)';
      if (titleEl) titleEl.textContent = 'User Login';
      if (subEl) subEl.textContent = 'Please enter your credentials to access Employee Attendance Portal.';
    });
  }

  if (toggleLoginPassBtn) {
    toggleLoginPassBtn.addEventListener('click', () => {
      const passInput = document.getElementById('login-password');
      const icon = toggleLoginPassBtn.querySelector('i');
      if (passInput) {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        if (icon) {
          icon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
      }
    });
  }

  const linkGotoSignup = document.getElementById('link-goto-signup');
  const linkGotoLogin = document.getElementById('link-goto-login');

  const showSignupForm = () => {
    if (loginTabBtn) loginTabBtn.classList.remove('active');
    if (signupTabBtn) signupTabBtn.classList.add('active');
    if (loginForm) loginForm.classList.add('hidden');
    if (signupForm) signupForm.classList.remove('hidden');
  };

  const showLoginForm = () => {
    if (signupTabBtn) signupTabBtn.classList.remove('active');
    if (loginTabBtn) loginTabBtn.classList.add('active');
    if (signupForm) signupForm.classList.add('hidden');
    if (loginForm) loginForm.classList.remove('hidden');
  };

  if (linkGotoSignup) linkGotoSignup.addEventListener('click', showSignupForm);
  if (linkGotoLogin) linkGotoLogin.addEventListener('click', showLoginForm);
  if (loginTabBtn) loginTabBtn.addEventListener('click', showLoginForm);
  if (signupTabBtn) signupTabBtn.addEventListener('click', showSignupForm);

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const errAlert = document.getElementById('login-error-alert');
      const errText = document.getElementById('login-error-text');

      if (errAlert) errAlert.classList.add('hidden');

      if (!username || !password) {
        const msg = 'Please enter both Username and Password';
        if (errText && errAlert) {
          errText.textContent = msg;
          errAlert.classList.remove('hidden');
        }
        showToast(msg, 'error');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      submitBtn.disabled = true;

      try {
        const res = await AuthModule.login(username, password, currentLoginRole);
        showToast(res.message || `${currentLoginRole} Login Successful!`, 'success');
        checkAuthAndRender();
      } catch (err) {
        const errorMsg = err.message || 'Login failed. Please check credentials.';
        if (errText && errAlert) {
          errText.textContent = errorMsg;
          errAlert.classList.remove('hidden');
        }
        showToast(errorMsg, 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Handle Admin / User Registration Submit
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawPassword = document.getElementById('reg-password').value.trim();
      const signupData = {
        ClientUkeyId: document.getElementById('reg-clientukeyid').value.trim() || `CLI-${Date.now()}`,
        CustId: document.getElementById('reg-custid').value.trim(),
        Username: document.getElementById('reg-username').value.trim(),
        Password: rawPassword,
        CompanyName: document.getElementById('reg-company').value.trim() || 'My Company',
        FirstName: document.getElementById('reg-firstname').value.trim(),
        LastName: document.getElementById('reg-lastname').value.trim(),
        Email: document.getElementById('reg-email').value.trim(),
        Mobile: document.getElementById('reg-mobile').value.trim(),
        Role: document.getElementById('reg-role').value || 'Admin',
        Address: document.getElementById('reg-address').value.trim(),
        IsActive: true
      };

      if (!signupData.CustId || !signupData.Username || !rawPassword) {
        showToast('CustId, Username, and Password are required!', 'error');
        return;
      }

      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
      submitBtn.disabled = true;

      try {
        const res = await AuthModule.signup(signupData);
        showToast(res.message || 'Registration Successful! Please log in.', 'success');
        signupForm.reset();
        loginTabBtn.click();
      } catch (err) {
        showToast(err.message || 'Registration failed.', 'error');
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Logout Button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await AuthModule.logout();
      showToast('Logged out successfully', 'info');
      checkAuthAndRender();
    });
  }

  // Handle Unauthorized Event
  window.addEventListener('auth:unauthorized', () => {
    showToast('Session expired. Please log in again.', 'error');
    checkAuthAndRender();
  });
}

// Authentication view switcher
function checkAuthAndRender() {
  const authView = document.getElementById('auth-view');
  const mainAppView = document.getElementById('main-app-view');

  if (AuthStorage.isAuthenticated()) {
    authView.classList.add('hidden');
    mainAppView.classList.remove('hidden');

    const user = AuthStorage.getUser();
    if (user) {
      document.getElementById('user-display-name').textContent = `${user.FirstName || ''} ${user.LastName || ''}`.trim() || user.Username || 'User';
      document.getElementById('user-display-role').textContent = user.Role || 'Employee';
      document.getElementById('user-avatar-initial').textContent = (user.FirstName || user.Username || 'U').charAt(0).toUpperCase();

      // Display CustId in panel topbar
      const topbarCustId = document.getElementById('topbar-custid-value');
      if (topbarCustId) {
        topbarCustId.textContent = user.CustId || 'N/A';
      }

      setupRoleBasedUI(user);
    }

    switchTab(AppState.activeTab);
  } else {
    authView.classList.remove('hidden');
    mainAppView.classList.add('hidden');
  }
}

function setupRoleBasedUI(user) {
  const isAdmin = user && (user.Role === 'Admin' || user.Role === 'Administrator');

  const navDepts = document.querySelector('[data-tab="departments"]');
  const navUsers = document.querySelector('[data-tab="registrations"]');
  const navMyProfile = document.getElementById('nav-item-myprofile');
  const navAttTitle = document.getElementById('nav-attendance-title');
  const quickAddBtn = document.querySelector('.navbar-actions');
  const thAttActions = document.getElementById('th-attendance-actions');

  if (isAdmin) {
    if (navDepts) navDepts.classList.remove('hidden');
    if (navUsers) navUsers.classList.remove('hidden');
    if (navMyProfile) navMyProfile.classList.add('hidden');
    if (navAttTitle) navAttTitle.textContent = 'Attendance Master';
    if (quickAddBtn) quickAddBtn.classList.remove('hidden');
    if (thAttActions) thAttActions.textContent = 'Admin Actions';
  } else {
    // Non-admin / Employee User Panel
    if (navDepts) navDepts.classList.add('hidden');
    if (navUsers) navUsers.classList.add('hidden');
    if (navMyProfile) navMyProfile.classList.remove('hidden');
    if (navAttTitle) navAttTitle.textContent = 'My Attendance';
    if (quickAddBtn) quickAddBtn.classList.add('hidden');
    if (thAttActions) thAttActions.textContent = 'Status Note';

    if (['departments', 'registrations'].includes(AppState.activeTab)) {
      AppState.activeTab = 'attendance';
    }
  }
}

// Navigation & Tab Switching
function initNavigation() {
  const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.getAttribute('data-tab');
      if (tabName) {
        switchTab(tabName);
      }
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }
}

function switchTab(tabName) {
  AppState.activeTab = tabName;

  document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });

  const activeContent = document.getElementById(`tab-content-${tabName}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }

  // Load section-specific data
  if (tabName === 'dashboard') {
    loadDashboardStats();
  } else if (tabName === 'employees') {
    DepartmentModule.populateDepartmentDropdown('filter-emp-department');
    loadEmployeeList();
  } else if (tabName === 'departments') {
    loadDepartmentList();
  } else if (tabName === 'registrations') {
    loadRegistrationList();
  } else if (tabName === 'attendance') {
    loadAttendanceList();
  } else if (tabName === 'myprofile') {
    loadMyProfile();
  }
}

// Load Dashboard Metrics
async function loadDashboardStats() {
  try {
    const empRes = await EmployeeModule.getEmployees({ pageSize: 500 });
    const employees = empRes.data || [];
    const totalEmp = empRes.total || employees.length;
    const activeEmp = employees.filter(e => e.IsActive === true || e.IsActive === 1 || e.IsActive === '1').length;

    const deptRes = await DepartmentModule.getDepartments();
    const totalDepts = deptRes.total || (deptRes.data ? deptRes.data.length : 0);

    const regRes = await AuthModule.getRegistrations();
    const totalRegs = regRes.total || (regRes.data ? regRes.data.length : 0);

    document.getElementById('stat-total-emp').textContent = totalEmp;
    document.getElementById('stat-active-emp').textContent = activeEmp;
    document.getElementById('stat-total-depts').textContent = totalDepts;
    document.getElementById('stat-total-users').textContent = totalRegs;

    // Render recent employees on dashboard card
    const recentTableBody = document.getElementById('dashboard-recent-emp-tbody');
    if (recentTableBody) {
      const recent = employees.slice(0, 5);
      if (recent.length === 0) {
        recentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;" class="text-muted">No employees registered yet.</td></tr>`;
      } else {
        recentTableBody.innerHTML = recent.map(emp => {
          const photoUrl = EmployeeModule.getPhotoUrl(emp.Img);
          const empFullName = `${emp.FirstName || ''} ${emp.LastName || ''}`.trim() || 'Employee';
          const avatarHtml = photoUrl 
            ? `<img src="${photoUrl}" class="emp-avatar-img" style="cursor:pointer;" title="Click for full page preview" onclick="window.openImageLightbox('${photoUrl}', '${empFullName.replace(/'/g, "\\'")}')" alt="photo" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'emp-avatar-placeholder\'>${(emp.FirstName||'E').charAt(0)}</div>';">`
            : `<div class="emp-avatar-placeholder">${(emp.FirstName||'E').charAt(0)}</div>`;

          return `
            <tr>
              <td>
                <div class="emp-avatar-cell">
                  ${avatarHtml}
                  <div>
                    <strong>${emp.FirstName || ''} ${emp.LastName || ''}</strong>
                    <div style="font-size:0.75rem;" class="text-muted">${emp.Email || emp.EmployeeId || 'N/A'}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-role">${emp.Role || 'Staff'}</span></td>
              <td>${emp.Mobile1 || 'N/A'}</td>
              <td>
                <span class="badge ${emp.IsActive ? 'badge-active' : 'badge-inactive'}">
                  ${emp.IsActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="window.viewEmployeeDetail('${emp.Id}')">
                  <i class="fas fa-eye"></i> View
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error("Dashboard stats error:", err);
  }
}

// EMPLOYEE MASTER LOGIC
function initEmployeeEvents() {
  // Search input debounce
  const searchInput = document.getElementById('search-emp-input');
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        AppState.searchTerm = e.target.value.trim();
        AppState.currentPage = 1;
        loadEmployeeList();
      }, 400);
    });
  }

  // Filter department
  const deptSelect = document.getElementById('filter-emp-department');
  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      AppState.departmentFilter = e.target.value;
      AppState.currentPage = 1;
      loadEmployeeList();
    });
  }

  // Filter status
  const statusSelect = document.getElementById('filter-emp-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      AppState.statusFilter = e.target.value;
      AppState.currentPage = 1;
      loadEmployeeList();
    });
  }

  // Open Create Employee Modal
  const addEmpBtn = document.getElementById('btn-add-employee');
  if (addEmpBtn) {
    addEmpBtn.addEventListener('click', () => {
      openAddEmployeeModal();
    });
  }

  // Employee Form Submit (Add / Edit)
  const empForm = document.getElementById('form-employee');
  if (empForm) {
    empForm.addEventListener('submit', handleEmployeeFormSubmit);
  }

  // Photo Input Live Preview
  const photoInput = document.getElementById('emp-img-file');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const previewBox = document.getElementById('emp-photo-preview');
      if (file && previewBox) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          previewBox.innerHTML = `<img src="${evt.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Confirm Delete Button
  const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!AppState.selectedEmployeeForDelete) return;
      try {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        await EmployeeModule.deleteEmployee(AppState.selectedEmployeeForDelete);
        showToast('Employee deleted successfully!', 'success');
        window.closeModal('modal-delete-confirm');
        loadEmployeeList();
      } catch (err) {
        showToast(err.message || 'Failed to delete employee.', 'error');
      } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = 'Delete Employee';
      }
    });
  }

  // Toggle Password Visibility Button
  const togglePassBtn = document.getElementById('btn-toggle-emp-password');
  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const passInput = document.getElementById('emp-password');
      const icon = togglePassBtn.querySelector('i');
      if (passInput) {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        if (icon) {
          icon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
      }
    });
  }
}

// Load Employee List Table
async function loadEmployeeList() {
  const tbody = document.getElementById('employee-table-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;"><i class="fas fa-circle-notch fa-spin fa-2x text-muted"></i><p style="margin-top:0.5rem;" class="text-muted">Loading Employees...</p></td></tr>`;

  try {
    const params = {
      page: AppState.currentPage,
      pageSize: AppState.pageSize,
      name: AppState.searchTerm,
      DepartmentID: AppState.departmentFilter,
      IsActive: AppState.statusFilter
    };

    const res = await EmployeeModule.getEmployees(params);
    const employees = res.data || [];
    AppState.totalRecords = res.total || employees.length;
    AppState.totalPages = Math.ceil(AppState.totalRecords / AppState.pageSize) || 1;

    renderEmployeeTable(employees);
    renderPagination();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--accent-danger); padding:2rem;"><i class="fas fa-exclamation-triangle fa-2x"></i><p style="margin-top:0.5rem;">${err.message || 'Error loading employee data'}</p></td></tr>`;
  }
}

function renderEmployeeTable(employees) {
  const tbody = document.getElementById('employee-table-tbody');
  if (!tbody) return;

  if (employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:3rem;" class="text-muted">
          <i class="fas fa-users-slash fa-3x" style="margin-bottom:1rem; opacity:0.5;"></i>
          <p style="font-size:1.1rem; font-weight:600;">No Employees Found</p>
          <p style="font-size:0.85rem;">Try adjusting your search criteria or add a new employee.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = employees.map(emp => {
    const photoUrl = EmployeeModule.getPhotoUrl(emp.Img);
    const empFullName = `${emp.FirstName || ''} ${emp.LastName || ''}`.trim() || 'Employee';
    const avatarHtml = photoUrl 
      ? `<img src="${photoUrl}" class="emp-avatar-img" style="cursor:pointer;" title="Click for full page preview" onclick="window.openImageLightbox('${photoUrl}', '${empFullName.replace(/'/g, "\\'")}')" alt="photo" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\'emp-avatar-placeholder\'>${(emp.FirstName||'E').charAt(0)}</div>';">`
      : `<div class="emp-avatar-placeholder">${(emp.FirstName||'E').charAt(0)}</div>`;

    return `
      <tr>
        <td>
          <div class="emp-avatar-cell">
            ${avatarHtml}
            <div>
              <strong>${emp.FirstName || ''} ${emp.LastName || ''}</strong>
              <div style="font-size:0.75rem;" class="text-muted">ID: ${emp.EmployeeId || emp.Id}</div>
            </div>
          </div>
        </td>
        <td>${emp.UserName || emp.CustId || 'N/A'}</td>
        <td>
          <div>${emp.Email || 'N/A'}</div>
          <div style="font-size:0.75rem;" class="text-muted">${emp.Mobile1 || ''}</div>
        </td>
        <td><span class="badge badge-role">${emp.Role || 'Employee'}</span></td>
        <td>${emp.SalaryAmount ? '₹' + emp.SalaryAmount : 'N/A'}</td>
        <td>
          <span class="badge ${emp.IsActive ? 'badge-active' : 'badge-inactive'}">
            <i class="fas ${emp.IsActive ? 'fa-check' : 'fa-times'}"></i>
            ${emp.IsActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary btn-icon btn-sm" title="View Profile" onclick="window.viewEmployeeDetail('${emp.Id}')">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-primary btn-icon btn-sm" title="Edit Employee" onclick="window.editEmployee('${emp.Id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-icon btn-sm" title="Delete Employee" onclick="window.confirmDeleteEmployee('${emp.Id}', '${(emp.FirstName||'') + ' ' + (emp.LastName||'')}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPagination() {
  const infoEl = document.getElementById('pagination-info');
  const controlsEl = document.getElementById('pagination-controls');
  if (!infoEl || !controlsEl) return;

  const start = AppState.totalRecords === 0 ? 0 : (AppState.currentPage - 1) * AppState.pageSize + 1;
  const end = Math.min(AppState.currentPage * AppState.pageSize, AppState.totalRecords);

  infoEl.textContent = `Showing ${start} to ${end} of ${AppState.totalRecords} employees`;

  let html = `
    <button class="btn btn-secondary btn-sm" ${AppState.currentPage === 1 ? 'disabled' : ''} onclick="window.changePage(${AppState.currentPage - 1})">
      <i class="fas fa-chevron-left"></i> Prev
    </button>
  `;

  for (let i = 1; i <= AppState.totalPages; i++) {
    if (i === 1 || i === AppState.totalPages || Math.abs(i - AppState.currentPage) <= 1) {
      html += `
        <button class="btn ${i === AppState.currentPage ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.changePage(${i})">
          ${i}
        </button>
      `;
    } else if (i === 2 || i === AppState.totalPages - 1) {
      html += `<span style="padding:0 0.25rem; color:var(--text-muted);">...</span>`;
    }
  }

  html += `
    <button class="btn btn-secondary btn-sm" ${AppState.currentPage >= AppState.totalPages ? 'disabled' : ''} onclick="window.changePage(${AppState.currentPage + 1})">
      Next <i class="fas fa-chevron-right"></i>
    </button>
  `;

  controlsEl.innerHTML = html;
}

window.changePage = function(page) {
  if (page < 1 || page > AppState.totalPages) return;
  AppState.currentPage = page;
  loadEmployeeList();
};

// Open Add Employee Modal
async function openAddEmployeeModal() {
  const form = document.getElementById('form-employee');
  if (!form) return;

  form.reset();
  document.getElementById('emp-flag').value = 'A';
  document.getElementById('emp-id').value = ''; // Primary Key Id left empty for auto-increment on INSERT
  document.getElementById('modal-employee-title').textContent = 'Create New Employee';

  // Password configuration for ADD mode
  const passInput = document.getElementById('emp-password');
  const passReq = document.getElementById('emp-password-req');
  const passHint = document.getElementById('emp-password-hint');
  if (passInput) {
    passInput.value = '';
    passInput.required = true;
    passInput.placeholder = 'Account Password';
  }
  if (passReq) passReq.style.display = 'inline';
  if (passHint) passHint.textContent = '(Required for new account)';

  // Auto-generate Unique Employee ID (UKID)
  const autoEmpId = 'EMP-' + Math.floor(100000 + Math.random() * 900000);
  const empIdInput = document.getElementById('emp-employeeid');
  if (empIdInput) empIdInput.value = autoEmpId;

  // Auto-fill & fix logged-in CustId to Admin CustId
  const currentUser = AuthStorage.getUser();
  const custIdInput = document.getElementById('emp-custid');
  const custIdHint = document.getElementById('emp-custid-hint');

  if (currentUser && currentUser.CustId) {
    custIdInput.value = currentUser.CustId;
  }
  custIdInput.readOnly = true;
  custIdInput.disabled = false;
  if (custIdHint) custIdHint.textContent = '(Fixed to Admin CustId)';

  const previewBox = document.getElementById('emp-photo-preview');
  if (previewBox) {
    previewBox.innerHTML = `<i class="fas fa-user"></i>`;
  }

  await DepartmentModule.populateDepartmentDropdown('emp-departmentid');
  window.openModal('modal-employee-form');
}

// Edit Employee Handler
window.editEmployee = async function(id) {
  try {
    const res = await EmployeeModule.getEmployeeById(id);
    const emp = res.data;
    if (!emp) throw new Error('Employee not found');

    const form = document.getElementById('form-employee');
    if (!form) return;

    form.reset();
    document.getElementById('modal-employee-title').textContent = `Edit Employee: ${emp.FirstName || ''} ${emp.LastName || ''}`;
    document.getElementById('emp-flag').value = 'U';
    document.getElementById('emp-id').value = emp.Id;

    // Fill EmployeeId (UKID) & basic fields
    const empIdInput = document.getElementById('emp-employeeid');
    if (empIdInput) empIdInput.value = emp.EmployeeId || ('EMP-' + emp.Id);
    document.getElementById('emp-firstname').value = emp.FirstName || '';
    document.getElementById('emp-lastname').value = emp.LastName || '';
    document.getElementById('emp-username').value = emp.UserName || '';
    
    // Set CustId and disable input on update
    const currentUser = AuthStorage.getUser();
    const custIdInput = document.getElementById('emp-custid');
    const custIdHint = document.getElementById('emp-custid-hint');
    custIdInput.value = emp.CustId || currentUser?.CustId || '';
    custIdInput.readOnly = true;
    custIdInput.disabled = true; // Disabled on update
    if (custIdHint) custIdHint.textContent = '(Disabled on Update)';
    document.getElementById('emp-email').value = emp.Email || '';
    document.getElementById('emp-mobile1').value = emp.Mobile1 || '';
    document.getElementById('emp-role').value = emp.Role || 'User';
    document.getElementById('emp-gender').value = emp.Gender || '';
    document.getElementById('emp-dob').value = emp.DOB || '';
    document.getElementById('emp-doj').value = emp.DOJ || '';
    document.getElementById('emp-salaryamount').value = emp.SalaryAmount || '';
    document.getElementById('emp-salarytype').value = emp.SalaryType || 'Monthly';
    document.getElementById('emp-isactive').value = emp.IsActive ? 'true' : 'false';
    document.getElementById('emp-add1').value = emp.Add1 || '';
    document.getElementById('emp-pan').value = emp.PAN || '';
    document.getElementById('emp-bankname').value = emp.BankName || '';
    document.getElementById('emp-accno').value = emp.AccNo || '';
    document.getElementById('emp-ifsc').value = emp.IFSC || '';
    document.getElementById('emp-highestdegree').value = emp.HighestDegree || '';
    document.getElementById('emp-degreename').value = emp.DegreeName || '';
    document.getElementById('emp-universityname').value = emp.UniversityName || '';
    document.getElementById('emp-passingyear').value = emp.PassingYear || '';

    // Password optional for UPDATE mode
  const passInput = document.getElementById('emp-password');
  const passReq = document.getElementById('emp-password-req');
  const passHint = document.getElementById('emp-password-hint');
  if (passInput) {
    passInput.value = '';
    passInput.required = false;
    passInput.placeholder = '•••••••• (Leave blank to keep current)';
  }
  if (passReq) passReq.style.display = 'none';
  if (passHint) passHint.textContent = '(Leave blank to keep existing, or enter new)';

    // Populate Department dropdown & select
    await DepartmentModule.populateDepartmentDropdown('emp-departmentid', emp.DepartmentId);

    // Photo Preview
    const previewBox = document.getElementById('emp-photo-preview');
    const photoUrl = EmployeeModule.getPhotoUrl(emp.Img);
    const empFullName = `${emp.FirstName || ''} ${emp.LastName || ''}`.trim() || 'Employee';
    if (previewBox) {
      if (photoUrl) {
        previewBox.innerHTML = `<img src="${photoUrl}" style="cursor:pointer;" title="Click for full page preview" onclick="window.openImageLightbox('${photoUrl}', '${empFullName.replace(/'/g, "\\'")}')" alt="Photo">`;
      } else {
        previewBox.innerHTML = `<i class="fas fa-user"></i>`;
      }
    }

    window.openModal('modal-employee-form');
  } catch (err) {
    showToast(err.message || 'Error loading employee details for editing', 'error');
  }
};

// Form Submit Handler (Add / Edit)
async function handleEmployeeFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const flag = document.getElementById('emp-flag').value;
  const submitBtn = form.querySelector('button[type="submit"]');

  const formData = new FormData(form);

  // Ensure CustId is attached even if input field is disabled on update
  const currentUser = AuthStorage.getUser();
  const currentCustIdVal = document.getElementById('emp-custid').value || currentUser?.CustId || '';
  formData.set('CustId', currentCustIdVal);

  if (flag === 'A') {
    // 1. On INSERT: Remove 'Id' from payload so database auto-increments primary key Id
    formData.delete('Id');

    // 2. Auto-set EmployeeId (UKID)
    const empIdVal = document.getElementById('emp-employeeid')?.value || ('EMP-' + Math.floor(100000 + Math.random() * 900000));
    formData.set('EmployeeId', empIdVal);
  } else if (flag === 'U') {
    // On UPDATE: Must pass primary key 'Id' to update matching record
    const primaryId = document.getElementById('emp-id').value;
    if (!primaryId) {
      showToast('Primary Employee ID is missing for update!', 'error');
      return;
    }
    formData.set('Id', primaryId);

    const empIdVal = document.getElementById('emp-employeeid')?.value || ('EMP-' + primaryId);
    formData.set('EmployeeId', empIdVal);
  }

  // Validation
  const firstName = formData.get('FirstName');
  const custId = formData.get('CustId');
  const userName = formData.get('UserName');
  const rawPassword = formData.get('Password');

  if (!firstName || !custId || !userName) {
    showToast('FirstName, CustId, and UserName are required fields!', 'error');
    return;
  }

  if (flag === 'A') {
    if (!rawPassword || rawPassword.trim() === '') {
      showToast('Password is required when creating a new employee!', 'error');
      return;
    }
    formData.set('Password', rawPassword);
  } else if (flag === 'U') {
    // On UPDATE: If password is empty or bullet placeholder, remove Password so existing password is kept!
    if (!rawPassword || rawPassword.trim() === '' || rawPassword.trim() === '••••••••') {
      formData.delete('Password');
    } else {
      formData.set('Password', rawPassword);
    }
  }

  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    const res = await EmployeeModule.saveEmployee(formData);
    showToast(res.message || (flag === 'A' ? 'Employee Created Successfully!' : 'Employee Updated Successfully!'), 'success');
    window.closeModal('modal-employee-form');
    loadEmployeeList();
  } catch (err) {
    showToast(err.message || 'Error saving employee details', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// View Employee Detail Drawer
window.viewEmployeeDetail = async function(id) {
  try {
    const res = await EmployeeModule.getEmployeeById(id);
    const emp = res.data;
    if (!emp) throw new Error('Employee details not found');

    const photoUrl = EmployeeModule.getPhotoUrl(emp.Img);
    const empFullName = `${emp.FirstName || ''} ${emp.LastName || ''}`.trim() || 'Employee';
    const photoHtml = photoUrl 
      ? `<img src="${photoUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--accent-primary); cursor:pointer; box-shadow: 0 4px 14px rgba(99,102,241,0.4);" title="Click for full page preview" onclick="window.openImageLightbox('${photoUrl}', '${empFullName.replace(/'/g, "\\'")}')" alt="Photo">`
      : `<div style="width:100px; height:100px; border-radius:50%; background:var(--accent-primary); color:white; display:flex; align-items:center; justify-content:center; font-size:2.5rem; font-weight:700;">${(emp.FirstName||'E').charAt(0)}</div>`;

    document.getElementById('view-emp-header').innerHTML = `
      <div style="display:flex; align-items:center; gap:1.5rem; margin-bottom:1.5rem;">
        ${photoHtml}
        <div>
          <h2 style="font-size:1.5rem; font-weight:700;">${emp.FirstName || ''} ${emp.LastName || ''}</h2>
          <div style="margin-top:0.25rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
            <span class="badge badge-role">${emp.Role || 'Staff'}</span>
            <span class="badge ${emp.IsActive ? 'badge-active' : 'badge-inactive'}">
              ${emp.IsActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p style="font-size:0.85rem; margin-top:0.4rem;" class="text-muted">Cust ID: ${emp.CustId || 'N/A'} | Employee ID: ${emp.EmployeeId || emp.Id}</p>
        </div>
      </div>
    `;

    document.getElementById('view-emp-body').innerHTML = `
      <div class="form-section-title"><i class="fas fa-id-card"></i> Personal Information</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">Username</div><div class="detail-value">${emp.UserName || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Email</div><div class="detail-value">${emp.Email || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Mobile</div><div class="detail-value">${emp.Mobile1 || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Gender</div><div class="detail-value">${emp.Gender || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Date of Birth</div><div class="detail-value">${emp.DOB || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Address</div><div class="detail-value">${emp.Add1 || 'N/A'}</div></div>
      </div>

      <div class="form-section-title"><i class="fas fa-briefcase"></i> Employment & Salary</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">Date of Joining</div><div class="detail-value">${emp.DOJ || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Role / Position</div><div class="detail-value">${emp.Role || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Salary Amount</div><div class="detail-value">${emp.SalaryAmount ? '₹' + emp.SalaryAmount : 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Salary Type</div><div class="detail-value">${emp.SalaryType || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Work Type</div><div class="detail-value">${emp.WorkType || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Office Location</div><div class="detail-value">${emp.OfficeLocation || 'N/A'}</div></div>
      </div>

      <div class="form-section-title"><i class="fas fa-university"></i> Banking & Statutory Info</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">PAN Number</div><div class="detail-value">${emp.PAN || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Bank Name</div><div class="detail-value">${emp.BankName || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Account No</div><div class="detail-value">${emp.AccNo || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">IFSC Code</div><div class="detail-value">${emp.IFSC || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">UAN Number</div><div class="detail-value">${emp.UANNo || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">ESIC Number</div><div class="detail-value">${emp.ESICNo || 'N/A'}</div></div>
      </div>

      <div class="form-section-title"><i class="fas fa-graduation-cap"></i> Qualification</div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">Highest Degree</div><div class="detail-value">${emp.HighestDegree || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Degree Name</div><div class="detail-value">${emp.DegreeName || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">University</div><div class="detail-value">${emp.UniversityName || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">Passing Year</div><div class="detail-value">${emp.PassingYear || 'N/A'}</div></div>
      </div>
    `;

    window.openModal('modal-view-employee');
  } catch (err) {
    showToast(err.message || 'Failed to fetch employee details', 'error');
  }
};

// Confirm Delete Dialog
window.confirmDeleteEmployee = function(id, name) {
  AppState.selectedEmployeeForDelete = id;
  document.getElementById('delete-emp-name').textContent = name || `ID #${id}`;
  window.openModal('modal-delete-confirm');
};

// DEPARTMENT MANAGEMENT LOGIC
function initDepartmentEvents() {
  const deptForm = document.getElementById('form-department');
  if (deptForm) {
    deptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const deptName = document.getElementById('dept-name').value.trim();
      const deptId = document.getElementById('dept-id').value;
      const flag = deptId ? 'U' : 'A';

      if (!deptName) {
        showToast('Department Name is required!', 'error');
        return;
      }

      try {
        await DepartmentModule.addOrUpdateDepartment({
          DepartmentID: deptId || undefined,
          DepartmentName: deptName,
          Flag: flag
        });
        showToast(`Department ${flag === 'A' ? 'Added' : 'Updated'} Successfully!`, 'success');
        deptForm.reset();
        document.getElementById('dept-id').value = '';
        loadDepartmentList();
      } catch (err) {
        showToast(err.message || 'Failed to save department', 'error');
      }
    });
  }
}

async function loadDepartmentList() {
  const tbody = document.getElementById('department-table-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;" class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>`;

  try {
    const res = await DepartmentModule.getDepartments();
    const depts = res.data || [];

    if (depts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;" class="text-muted">No departments found.</td></tr>`;
      return;
    }

    tbody.innerHTML = depts.map(d => `
      <tr>
        <td><strong>#${d.DepartmentID || d.Id || ''}</strong></td>
        <td>${d.DepartmentName || ''}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="window.deleteDepartment('${d.DepartmentID || d.Id}')">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--accent-danger);">${err.message || 'Failed to load departments'}</td></tr>`;
  }
}

window.deleteDepartment = async function(id) {
  if (!confirm('Are you sure you want to delete this department?')) return;
  try {
    await DepartmentModule.deleteDepartment(id);
    showToast('Department Deleted Successfully', 'success');
    loadDepartmentList();
  } catch (err) {
    showToast(err.message || 'Failed to delete department', 'error');
  }
};

// REGISTRATIONS LOGIC
async function loadRegistrationList() {
  const tbody = document.getElementById('registrations-table-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;" class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>`;

  try {
    const res = await AuthModule.getRegistrations();
    const users = res.data || [];

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;" class="text-muted">No registered users found.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${u.CustId || 'N/A'}</strong></td>
        <td>${u.FirstName || ''} ${u.LastName || ''}</td>
        <td>${u.Username || ''}</td>
        <td>${u.Email || 'N/A'}</td>
        <td><span class="badge badge-role">${u.Role || 'User'}</span></td>
        <td>
          <span class="badge ${u.IsActive ? 'badge-active' : 'badge-inactive'}">
            ${u.IsActive ? 'Active' : 'Inactive'}
          </span>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--accent-danger);">${err.message || 'Failed to load registrations'}</td></tr>`;
  }
}

// ATTENDANCE MANAGEMENT LOGIC
function initAttendanceEvents() {
  const checkInBtn = document.getElementById('btn-punch-checkin');
  const checkOutBtn = document.getElementById('btn-punch-checkout');
  const attForm = document.getElementById('form-attendance-edit');

  const today = new Date().toISOString().split('T')[0];
  const dateDisplay = document.getElementById('punch-date-display');
  if (dateDisplay) {
    dateDisplay.textContent = `Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  }

  // Filter Date & Status event listeners
  const filterDate = document.getElementById('filter-attendance-date');
  const filterStatus = document.getElementById('filter-attendance-status');

  if (filterDate) filterDate.addEventListener('change', loadAttendanceList);
  if (filterStatus) filterStatus.addEventListener('change', loadAttendanceList);

  if (checkInBtn) {
    checkInBtn.addEventListener('click', async () => {
      const user = AuthStorage.getUser();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const empUkid = user?.ClientUkeyId || user?.Username || 'EMP-1';

      try {
        checkInBtn.disabled = true;
        await AttendanceModule.addOrUpdateAttendance({
          empukid: empUkid,
          date: today,
          check_in: timeStr,
          status: 'Present',
          Flag: 'A'
        });
        showToast(`Checked In successfully at ${timeStr}!`, 'success');
        loadAttendanceList();
      } catch (err) {
        showToast(err.message || 'Check-in failed', 'error');
      } finally {
        checkInBtn.disabled = false;
      }
    });
  }

  if (checkOutBtn) {
    checkOutBtn.addEventListener('click', async () => {
      const user = AuthStorage.getUser();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const empUkid = user?.ClientUkeyId || user?.Username || 'EMP-1';

      try {
        checkOutBtn.disabled = true;
        await AttendanceModule.addOrUpdateAttendance({
          empukid: empUkid,
          date: today,
          check_out: timeStr,
          status: 'Present',
          Flag: 'A'
        });
        showToast(`Checked Out successfully at ${timeStr}!`, 'success');
        loadAttendanceList();
      } catch (err) {
        showToast(err.message || 'Check-out failed', 'error');
      } finally {
        checkOutBtn.disabled = false;
      }
    });
  }

  // Admin edit attendance submit
  if (attForm) {
    attForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = AuthStorage.getUser();
      const isAdmin = user && (user.Role === 'Admin' || user.Role === 'Administrator');
      if (!isAdmin) {
        showToast('Only Admin can edit attendance records!', 'error');
        return;
      }

      const id = document.getElementById('edit-att-id').value;
      const empukid = document.getElementById('edit-att-empukid').value;
      const date = document.getElementById('edit-att-date').value;
      const check_in = document.getElementById('edit-att-checkin').value;
      const check_out = document.getElementById('edit-att-checkout').value;
      const status = document.getElementById('edit-att-status').value;

      try {
        await AttendanceModule.addOrUpdateAttendance({
          id,
          empukid,
          date,
          check_in,
          check_out,
          status,
          Flag: 'U'
        });
        showToast('Attendance updated successfully by Admin!', 'success');
        window.closeModal('modal-attendance-edit');
        loadAttendanceList();
      } catch (err) {
        showToast(err.message || 'Failed to update attendance', 'error');
      }
    });
  }
}

async function loadAttendanceList() {
  const tbody = document.getElementById('attendance-table-tbody');
  if (!tbody) return;

  const user = AuthStorage.getUser();
  const isAdmin = user && (user.Role === 'Admin' || user.Role === 'Administrator');

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;" class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading attendance logs...</td></tr>`;

  try {
    const params = {};
    if (!isAdmin && user) {
      params.empukid = user.ClientUkeyId || user.Username;
    }

    const dateFilter = document.getElementById('filter-attendance-date')?.value;
    const statusFilter = document.getElementById('filter-attendance-status')?.value;
    if (dateFilter) params.date = dateFilter;
    if (statusFilter) params.status = statusFilter;

    const res = await AttendanceModule.getAttendance(params);
    const logs = res.data || [];

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;" class="text-muted">No attendance logs recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(att => {
      const statusClass = att.status === 'Present' ? 'badge-active' : att.status === 'Absent' ? 'badge-inactive' : 'badge-role';
      const actionHtml = isAdmin 
        ? `<div style="display:flex; gap:0.4rem;">
             <button class="btn btn-primary btn-sm" title="Edit (Admin Only)" onclick="window.openEditAttendanceModal('${att.id}', '${att.empukid}', '${att.date}', '${att.check_in||''}', '${att.check_out||''}', '${att.status||'Present'}')">
               <i class="fas fa-edit"></i> Edit
             </button>
             <button class="btn btn-danger btn-sm" title="Delete (Admin Only)" onclick="window.deleteAttendanceRecord('${att.id}')">
               <i class="fas fa-trash-alt"></i>
             </button>
           </div>`
        : `<span style="font-size:0.75rem; color:var(--text-muted);"><i class="fas fa-lock"></i> Read-Only (Admin Edit Only)</span>`;

      return `
        <tr>
          <td><strong>${att.date || 'N/A'}</strong></td>
          <td>
            <div><strong>${att.name || att.empukid || 'Employee'}</strong></div>
            <div style="font-size:0.75rem;" class="text-muted">UKID: ${att.empukid || 'N/A'}</div>
          </td>
          <td><span class="text-success"><i class="fas fa-sign-in-alt"></i> ${att.check_in || 'N/A'}</span></td>
          <td><span class="text-warning"><i class="fas fa-sign-out-alt"></i> ${att.check_out || 'N/A'}</span></td>
          <td><span class="badge ${statusClass}">${att.status || 'Present'}</span></td>
          <td>${actionHtml}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--accent-danger);">${err.message || 'Error loading attendance logs'}</td></tr>`;
  }
}

window.openEditAttendanceModal = function(id, empukid, date, checkIn, checkOut, status) {
  const user = AuthStorage.getUser();
  const isAdmin = user && (user.Role === 'Admin' || user.Role === 'Administrator');
  if (!isAdmin) {
    showToast('Only Admin can edit attendance records!', 'error');
    return;
  }

  document.getElementById('edit-att-id').value = id;
  document.getElementById('edit-att-empukid').value = empukid;
  document.getElementById('edit-att-date').value = date || '';
  document.getElementById('edit-att-checkin').value = checkIn || '';
  document.getElementById('edit-att-checkout').value = checkOut || '';
  document.getElementById('edit-att-status').value = status || 'Present';

  window.openModal('modal-attendance-edit');
};

window.deleteAttendanceRecord = async function(id) {
  const user = AuthStorage.getUser();
  const isAdmin = user && (user.Role === 'Admin' || user.Role === 'Administrator');
  if (!isAdmin) {
    showToast('Only Admin can delete attendance records!', 'error');
    return;
  }

  if (!confirm('Are you sure you want to delete this attendance record?')) return;
  try {
    await AttendanceModule.deleteAttendance(id);
    showToast('Attendance record deleted successfully!', 'success');
    loadAttendanceList();
  } catch (err) {
    showToast(err.message || 'Failed to delete attendance', 'error');
  }
};

// MY PROFILE LOGIC FOR EMPLOYEE USER PANEL
async function loadMyProfile() {
  const container = document.getElementById('myprofile-card-content');
  if (!container) return;

  const user = AuthStorage.getUser();
  if (!user) {
    container.innerHTML = `<p class="text-muted">No profile details available.</p>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:2rem; flex-wrap:wrap; margin-bottom:2rem;">
      <div style="width:110px; height:110px; border-radius:50%; background:var(--accent-primary); color:white; display:flex; align-items:center; justify-content:center; font-size:3rem; font-weight:700; border:4px solid var(--accent-secondary); box-shadow:0 10px 25px rgba(99,102,241,0.4);">
        ${(user.FirstName || user.Username || 'E').charAt(0).toUpperCase()}
      </div>
      <div>
        <h2 style="font-size:1.8rem; font-weight:700; color:white;">${user.FirstName || ''} ${user.LastName || ''}</h2>
        <div style="margin-top:0.4rem; display:flex; gap:0.5rem;">
          <span class="badge badge-role">${user.Role || 'Employee'}</span>
          <span class="badge badge-active"><i class="fas fa-check-circle"></i> Active Account</span>
        </div>
        <p style="font-size:0.9rem; color:var(--text-muted); margin-top:0.5rem;">Username: <strong>${user.Username || ''}</strong> | CustID: <strong>${user.CustId || ''}</strong></p>
      </div>
    </div>

    <div class="form-section-title"><i class="fas fa-id-card"></i> Personal Details</div>
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Full Name</div><div class="detail-value">${user.FirstName || ''} ${user.LastName || ''}</div></div>
      <div class="detail-item"><div class="detail-label">Username</div><div class="detail-value">${user.Username || 'N/A'}</div></div>
      <div class="detail-item"><div class="detail-label">Email Address</div><div class="detail-value">${user.Email || 'N/A'}</div></div>
      <div class="detail-item"><div class="detail-label">Mobile Contact</div><div class="detail-value">${user.Mobile || 'N/A'}</div></div>
    </div>
  `;
}
