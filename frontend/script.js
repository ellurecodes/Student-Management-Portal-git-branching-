/**
 * CampusCore Student Information Portal - Client Controller
 * Strict 1RV Validation, Department Analytics & Responsive UI
 */

const API_BASE = "http://localhost:5000/api";

// Department Color Codes & Badges
const DEPT_CONFIG = {
  CSE:  { color: "#60a5fa", bg: "rgba(59, 130, 246, 0.8)",  class: "dept-CSE" },
  ISE:  { color: "#2dd4bf", bg: "rgba(20, 184, 166, 0.8)",  class: "dept-ISE" },
  ECE:  { color: "#c084fc", bg: "rgba(168, 85, 247, 0.8)",  class: "dept-ECE" },
  EEE:  { color: "#fbbf24", bg: "rgba(245, 158, 11, 0.8)",  class: "dept-EEE" },
  ME:   { color: "#f87171", bg: "rgba(239, 68, 68, 0.8)",   class: "dept-ME" },
  CIV:  { color: "#34d399", bg: "rgba(16, 185, 129, 0.8)",  class: "dept-CIV" },
  AIML: { color: "#f472b6", bg: "rgba(236, 72, 153, 0.8)",  class: "dept-AIML" },
  DS:   { color: "#818cf8", bg: "rgba(99, 102, 241, 0.8)",  class: "dept-DS" }
};
const DEFAULT_DEPT = { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.8)", class: "" };

// Validation Patterns
const VALIDATION = {
  // Only alphabetic letters and single spaces, 2 to 100 characters
  nameRegex: /^[A-Za-z\s]{2,100}$/,
  // Strict 1RV format: starts with 1RV + 2 digits + 2 to 4 branch letters + 3 digits (e.g. 1RV24CS001, 1RV25CS205)
  usnRegex: /^1RV[0-9]{2}[A-Z]{2,4}[0-9]{3}$/,
  // Standard valid email format
  emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

// Application State
let studentsList = [];
let filteredList = [];
let currentViewMode = localStorage.getItem("enamm_view_mode") || "table"; // 'table' or 'grid'
let chartInstance = null;
let searchTimer = null;
let studentToDelete = null;

// DOM Elements
const el = {
  // Topbar & Navigation
  appSidebar: document.getElementById("appSidebar"),
  menuToggleBtn: document.getElementById("menuToggleBtn"),
  topSearchInput: document.getElementById("topSearchInput"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeIconSun: document.getElementById("themeIconSun"),
  themeIconMoon: document.getElementById("themeIconMoon"),
  topAddBtn: document.getElementById("topAddBtn"),
  topExportBtn: document.getElementById("topExportBtn"),
  sidebarAddBtn: document.getElementById("sidebarAddBtn"),
  sidebarExportBtn: document.getElementById("sidebarExportBtn"),
  sidebarTotalPill: document.getElementById("sidebarTotalPill"),
  sidebarLatencyBadge: document.getElementById("sidebarLatencyBadge"),
  systemStatusCard: document.getElementById("systemStatusCard"),
  statusPulseDot: document.getElementById("statusPulseDot"),
  statusLabelText: document.getElementById("statusLabelText"),
  systemEngineNote: document.getElementById("systemEngineNote"),

  // KPIs
  kpiTotalStudents: document.getElementById("kpiTotalStudents"),
  kpiTotalNote: document.getElementById("kpiTotalNote"),
  kpiDepartments: document.getElementById("kpiDepartments"),
  kpiSemesters: document.getElementById("kpiSemesters"),
  kpiServerStatus: document.getElementById("kpiServerStatus"),
  kpiStorageNote: document.getElementById("kpiStorageNote"),
  portalDateVal: document.getElementById("portalDateVal"),

  // Chart
  departmentChart: document.getElementById("departmentChart"),
  deptAnalyticsBadges: document.getElementById("deptAnalyticsBadges"),

  // Filters & Controls
  departmentFilter: document.getElementById("departmentFilter"),
  semesterFilter: document.getElementById("semesterFilter"),
  sortBy: document.getElementById("sortBy"),
  viewModeTableBtn: document.getElementById("viewModeTableBtn"),
  viewModeGridBtn: document.getElementById("viewModeGridBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  refreshSvg: document.getElementById("refreshSvg"),
  recordCountSubtitle: document.getElementById("recordCountSubtitle"),
  filterTagsBar: document.getElementById("filterTagsBar"),
  filterTagsList: document.getElementById("filterTagsList"),
  clearAllFiltersBtn: document.getElementById("clearAllFiltersBtn"),
  footerTotalDisplay: document.getElementById("footerTotalDisplay"),
  footerDownloadBtn: document.getElementById("footerDownloadBtn"),

  // Containers
  tableViewContainer: document.getElementById("tableViewContainer"),
  gridViewContainer: document.getElementById("gridViewContainer"),
  studentsTableBody: document.getElementById("studentsTableBody"),

  // Add / Edit Modal
  studentDialog: document.getElementById("studentDialog"),
  closeDialogBtn: document.getElementById("closeDialogBtn"),
  cancelFormBtn: document.getElementById("cancelFormBtn"),
  studentForm: document.getElementById("studentForm"),
  dialogTitle: document.getElementById("dialogTitle"),
  dialogHeaderPill: document.getElementById("dialogHeaderPill"),
  studentId: document.getElementById("studentId"),
  nameInput: document.getElementById("name"),
  nameHint: document.getElementById("nameHint"),
  nameFeedback: document.getElementById("nameFeedback"),
  nameError: document.getElementById("nameError"),
  usnInput: document.getElementById("usn"),
  usnFeedback: document.getElementById("usnFeedback"),
  usnError: document.getElementById("usnError"),
  emailInput: document.getElementById("email"),
  emailFeedback: document.getElementById("emailFeedback"),
  emailError: document.getElementById("emailError"),
  departmentInput: document.getElementById("department"),
  semesterInput: document.getElementById("semester"),
  phoneInput: document.getElementById("phone"),
  formAlertBox: document.getElementById("formAlertBox"),
  submitStudentBtn: document.getElementById("submitStudentBtn"),
  submitBtnText: document.getElementById("submitBtnText"),
  submitSpinner: document.getElementById("submitSpinner"),

  // Profile View Modal
  viewDetailsDialog: document.getElementById("viewDetailsDialog"),
  closeProfileBtn: document.getElementById("closeProfileBtn"),
  profileAvatar: document.getElementById("profileAvatar"),
  profileName: document.getElementById("profileName"),
  profileUsn: document.getElementById("profileUsn"),
  profileDept: document.getElementById("profileDept"),
  profileSemester: document.getElementById("profileSemester"),
  profileEmail: document.getElementById("profileEmail"),
  profilePhone: document.getElementById("profilePhone"),
  profilePhoneCopy: document.getElementById("profilePhoneCopy"),
  profileCreated: document.getElementById("profileCreated"),
  profileEditBtn: document.getElementById("profileEditBtn"),
  profileDeleteBtn: document.getElementById("profileDeleteBtn"),

  // Delete Confirm Modal
  deleteConfirmDialog: document.getElementById("deleteConfirmDialog"),
  deleteTargetName: document.getElementById("deleteTargetName"),
  deleteTargetUsn: document.getElementById("deleteTargetUsn"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  deleteBtnLabel: document.getElementById("deleteBtnLabel"),
  deleteSpinner: document.getElementById("deleteSpinner"),

  // Toasts
  toastContainer: document.getElementById("toastContainer")
};

/* ==========================================================================
   Utilities
   ========================================================================== */

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[c]);
}

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "ST";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getAvatarColor(name = "") {
  const gradients = [
    ["#4f46e5", "#7c3aed"],
    ["#0284c7", "#0ea5e9"],
    ["#059669", "#10b981"],
    ["#d97706", "#f59e0b"],
    ["#db2777", "#ec4899"],
    ["#4338ca", "#6366f1"],
    ["#0f766e", "#14b8a6"],
    ["#be185d", "#f43f5e"]
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % gradients.length;
  return `linear-gradient(135deg, ${gradients[idx][0]}, ${gradients[idx][1]})`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function updateSystemClock() {
  const now = new Date();
  const options = { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  el.portalDateVal.textContent = now.toLocaleDateString("en-US", options);
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */

function showToast(title, message = "", type = "success", duration = 4000) {
  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;

  const iconSvg = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg[type] || iconSvg.info}</div>
    <div class="toast-texts">
      <div class="toast-title">${escapeHTML(title)}</div>
      ${message ? `<div class="toast-msg">${escapeHTML(message)}</div>` : ""}
    </div>
    <button class="toast-close" type="button" aria-label="Close">✕</button>
    <div class="toast-bar" style="animation-duration: ${duration}ms"></div>
  `;

  const closeToast = () => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 200);
  };

  toast.querySelector(".toast-close").addEventListener("click", closeToast);
  el.toastContainer.appendChild(toast);
  setTimeout(closeToast, duration);
}

/* ==========================================================================
   Theme Management (Light / Dark)
   ========================================================================== */

function initTheme() {
  const saved = localStorage.getItem("enamm_theme") || "dark";
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("enamm_theme", theme);

  if (theme === "dark") {
    el.themeIconSun.classList.add("hidden");
    el.themeIconMoon.classList.remove("hidden");
  } else {
    el.themeIconSun.classList.remove("hidden");
    el.themeIconMoon.classList.add("hidden");
  }

  if (chartInstance) updateChartColors();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
}

el.themeToggleBtn.addEventListener("click", toggleTheme);

/* ==========================================================================
   API Communication & Status
   ========================================================================== */

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
  } catch (err) {
    throw new Error("Unable to connect to backend server. Make sure Node.js is running on port 5000.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request error (${response.status})`);
  }
  return data;
}

async function checkApiPing() {
  const t0 = performance.now();
  try {
    const health = await apiRequest("/health");
    const ms = Math.round(performance.now() - t0);

    el.statusPulseDot.classList.remove("offline");
    el.statusLabelText.textContent = "Server Online";
    el.sidebarLatencyBadge.textContent = `${ms} ms`;
    el.kpiServerStatus.textContent = "Connected";
    el.kpiServerStatus.style.color = "var(--success)";

    if (health.database === "connected") {
      el.systemEngineNote.textContent = "MongoDB Connected";
      el.kpiStorageNote.textContent = "MongoDB Database";
    } else {
      el.systemEngineNote.textContent = "Local Storage Engine";
      el.kpiStorageNote.textContent = "Local JSON Engine";
    }
  } catch (err) {
    el.statusPulseDot.classList.add("offline");
    el.statusLabelText.textContent = "Server Offline";
    el.sidebarLatencyBadge.textContent = "Offline";
    el.kpiServerStatus.textContent = "Offline";
    el.kpiServerStatus.style.color = "var(--danger)";
    el.systemEngineNote.textContent = "Port 5000 Unreachable";
  }
}

el.systemStatusCard.addEventListener("click", () => {
  checkApiPing();
  showToast("Testing Connection", "Pinging backend server...", "info", 1500);
});

/* ==========================================================================
   Data Fetching & Pipeline
   ========================================================================== */

async function fetchStudents() {
  setLoadingState(true);
  try {
    const params = new URLSearchParams();
    const searchVal = el.topSearchInput.value.trim();
    const deptVal = el.departmentFilter.value;
    const semVal = el.semesterFilter.value;

    if (searchVal) params.set("search", searchVal);
    if (deptVal) params.set("department", deptVal);
    if (semVal) params.set("semester", semVal);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await apiRequest(`/students${query}`);
    studentsList = res.data || [];

    applySorting();
    renderDirectory();
    updateKpis();
    renderDepartmentChart();
    renderFilterPills();
    checkApiPing();
  } catch (err) {
    renderEmptyOrError(err.message);
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(loading) {
  if (loading) {
    el.refreshSvg.classList.add("rotating-icon");
    el.studentsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="table-state-cell">
          <div class="loader-spinner"></div>
          <span>Loading student records...</span>
        </td>
      </tr>
    `;
  } else {
    el.refreshSvg.classList.remove("rotating-icon");
  }
}

/* ==========================================================================
   Sorting & KPIs
   ========================================================================== */

function applySorting() {
  const mode = el.sortBy.value;
  filteredList = [...studentsList];

  filteredList.sort((a, b) => {
    switch (mode) {
      case "nameAsc":
        return (a.name || "").localeCompare(b.name || "");
      case "nameDesc":
        return (b.name || "").localeCompare(a.name || "");
      case "usnAsc":
        return (a.usn || "").localeCompare(b.usn || "");
      case "semesterAsc":
        return Number(a.semester || 0) - Number(b.semester || 0);
      case "semesterDesc":
        return Number(b.semester || 0) - Number(a.semester || 0);
      case "newest":
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });
}

function updateKpis() {
  const total = studentsList.length;
  el.kpiTotalStudents.textContent = total;
  el.sidebarTotalPill.textContent = total;
  el.kpiTotalNote.textContent = total === 1 ? "1 student record" : `${total} student records`;

  const uniqueDepts = new Set(studentsList.map(s => (s.department || "").toUpperCase()).filter(Boolean));
  el.kpiDepartments.textContent = uniqueDepts.size;

  const uniqueSems = new Set(studentsList.map(s => Number(s.semester)).filter(n => n >= 1 && n <= 8));
  el.kpiSemesters.textContent = uniqueSems.size ? `${uniqueSems.size} of 8` : "0";

  el.recordCountSubtitle.textContent = `Showing ${filteredList.length} of ${total} students`;
  el.footerTotalDisplay.textContent = `${filteredList.length} of ${total} students displayed`;
}

function renderFilterPills() {
  const searchVal = el.topSearchInput.value.trim();
  const deptVal = el.departmentFilter.value;
  const semVal = el.semesterFilter.value;

  const filters = [];
  if (searchVal) filters.push({ type: "search", label: `Search: "${searchVal}"` });
  if (deptVal) filters.push({ type: "department", label: `Dept: ${deptVal}` });
  if (semVal) filters.push({ type: "semester", label: `Semester ${semVal}` });

  if (filters.length > 0) {
    el.filterTagsBar.classList.remove("hidden");
    el.filterTagsList.innerHTML = filters.map(f => `
      <span class="filter-badge-item">
        ${escapeHTML(f.label)}
        <span class="close-tag" data-tag-type="${f.type}">&times;</span>
      </span>
    `).join("");
  } else {
    el.filterTagsBar.classList.add("hidden");
    el.filterTagsList.innerHTML = "";
  }
}

el.filterTagsList.addEventListener("click", e => {
  const closeBtn = e.target.closest(".close-tag");
  if (!closeBtn) return;
  const type = closeBtn.dataset.tagType;
  if (type === "search") el.topSearchInput.value = "";
  if (type === "department") el.departmentFilter.value = "";
  if (type === "semester") el.semesterFilter.value = "";
  fetchStudents();
});

el.clearAllFiltersBtn.addEventListener("click", () => {
  el.topSearchInput.value = "";
  el.departmentFilter.value = "";
  el.semesterFilter.value = "";
  el.sortBy.value = "newest";
  fetchStudents();
});

/* ==========================================================================
   Directory Rendering (Table & Grid Card Views)
   ========================================================================== */

function setViewMode(mode) {
  currentViewMode = mode;
  localStorage.setItem("enamm_view_mode", mode);

  if (mode === "grid") {
    el.viewModeTableBtn.classList.remove("active");
    el.viewModeGridBtn.classList.add("active");
    el.tableViewContainer.classList.add("hidden");
    el.gridViewContainer.classList.remove("hidden");
  } else {
    el.viewModeTableBtn.classList.add("active");
    el.viewModeGridBtn.classList.remove("active");
    el.tableViewContainer.classList.remove("hidden");
    el.gridViewContainer.classList.add("hidden");
  }
  renderDirectory();
}

el.viewModeTableBtn.addEventListener("click", () => setViewMode("table"));
el.viewModeGridBtn.addEventListener("click", () => setViewMode("grid"));

function renderDirectory() {
  if (filteredList.length === 0) {
    renderEmptyOrError();
    return;
  }

  // 1. Table View Rendering
  el.studentsTableBody.innerHTML = filteredList.map(student => {
    const initials = getInitials(student.name);
    const avatarBg = getAvatarColor(student.name);
    const deptInfo = DEPT_CONFIG[student.department] || DEFAULT_DEPT;
    const dateStr = formatDisplayDate(student.createdAt);

    return `
      <tr data-student-id="${escapeHTML(student._id)}">
        <!-- Student Info -->
        <td>
          <div class="student-item-block">
            <div class="student-avatar-ring" style="background: ${avatarBg};">
              ${escapeHTML(initials)}
            </div>
            <div class="student-name-box">
              <span class="student-name-text" data-action="view" data-id="${escapeHTML(student._id)}">
                ${escapeHTML(student.name)}
              </span>
              <span class="student-timestamp">Enrolled ${escapeHTML(dateStr)}</span>
            </div>
          </div>
        </td>

        <!-- USN (1RV Format) -->
        <td>
          <span class="usn-badge font-mono">${escapeHTML(student.usn)}</span>
        </td>

        <!-- Department -->
        <td>
          <span class="dept-pill ${deptInfo.class}">${escapeHTML(student.department)}</span>
        </td>

        <!-- Semester -->
        <td>
          <span class="sem-pill">Sem ${escapeHTML(student.semester)}</span>
        </td>

        <!-- Contact Info -->
        <td>
          <div class="contact-block">
            <a class="contact-email-link" href="mailto:${escapeHTML(student.email)}" title="Send email">
              ${escapeHTML(student.email)}
            </a>
            ${student.phone ? `<span class="contact-phone-text">${escapeHTML(student.phone)}</span>` : ""}
          </div>
        </td>

        <!-- Action Buttons -->
        <td>
          <div class="table-action-group">
            <button class="action-tool-btn btn-view" data-action="view" data-id="${escapeHTML(student._id)}" title="View Profile">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="action-tool-btn btn-edit" data-action="edit" data-id="${escapeHTML(student._id)}" title="Edit Student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-tool-btn btn-delete" data-action="delete" data-id="${escapeHTML(student._id)}" title="Delete Student">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  // 2. Grid Cards View Rendering
  el.gridViewContainer.innerHTML = filteredList.map(student => {
    const initials = getInitials(student.name);
    const avatarBg = getAvatarColor(student.name);
    const deptInfo = DEPT_CONFIG[student.department] || DEFAULT_DEPT;

    return `
      <div class="student-card-item">
        <div class="card-item-top">
          <div class="student-avatar-ring" style="background: ${avatarBg};">
            ${escapeHTML(initials)}
          </div>
          <div class="card-item-meta">
            <span class="card-item-name">${escapeHTML(student.name)}</span>
            <span class="usn-badge font-mono" style="margin-top: 4px;">${escapeHTML(student.usn)}</span>
          </div>
        </div>

        <div class="card-item-pills">
          <span class="dept-pill ${deptInfo.class}">${escapeHTML(student.department)}</span>
          <span class="sem-pill">Sem ${escapeHTML(student.semester)}</span>
        </div>

        <div class="card-item-contacts">
          <span class="text-break">${escapeHTML(student.email)}</span>
          ${student.phone ? `<span class="text-subtle">${escapeHTML(student.phone)}</span>` : ""}
        </div>

        <div class="card-item-actions">
          <button class="action-tool-btn btn-view" data-action="view" data-id="${escapeHTML(student._id)}" title="View Profile">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="action-tool-btn btn-edit" data-action="edit" data-id="${escapeHTML(student._id)}" title="Edit Student">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="action-tool-btn btn-delete" data-action="delete" data-id="${escapeHTML(student._id)}" title="Delete Student">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function renderEmptyOrError(errorMsg) {
  const content = `
    <div style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; color: var(--text-subtle);">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); margin-bottom: 6px;">
        ${errorMsg ? "Server Communication Error" : "No Student Records Found"}
      </div>
      <div style="font-size: 0.85rem; max-width: 400px; margin: 0 auto 16px;">
        ${errorMsg ? escapeHTML(errorMsg) : "No student matches the current search or filters. Add a new student or clear your filters."}
      </div>
      <button class="btn btn-primary btn-sm" onclick="openAddDialog()">＋ Add New Student</button>
    </div>
  `;

  el.studentsTableBody.innerHTML = `<tr><td colspan="6">${content}</td></tr>`;
  el.gridViewContainer.innerHTML = content;
}

/* ==========================================================================
   Department Analytics Chart (Chart.js)
   ========================================================================== */

function getChartThemeSettings() {
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  return {
    textColor: isDark ? "#94a3b8" : "#64748b",
    gridColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)"
  };
}

function updateChartColors() {
  if (!chartInstance) return;
  const cfg = getChartThemeSettings();
  chartInstance.options.scales.x.ticks.color = cfg.textColor;
  chartInstance.options.scales.x.grid.color = cfg.gridColor;
  chartInstance.options.scales.y.ticks.color = cfg.textColor;
  chartInstance.options.scales.y.grid.color = cfg.gridColor;
  chartInstance.update();
}

function renderDepartmentChart() {
  const canvas = el.departmentChart;
  if (!canvas || typeof Chart === "undefined") return;

  const counts = {};
  studentsList.forEach(s => {
    const dept = (s.department || "Other").toUpperCase();
    counts[dept] = (counts[dept] || 0) + 1;
  });

  const labels = Object.keys(counts).sort();
  const data = labels.map(l => counts[l]);
  const bgColors = labels.map(l => (DEPT_CONFIG[l] ? DEPT_CONFIG[l].bg : DEFAULT_DEPT.bg));
  const borderColors = labels.map(l => (DEPT_CONFIG[l] ? DEPT_CONFIG[l].color : DEFAULT_DEPT.color));

  // Render quick badges
  el.deptAnalyticsBadges.innerHTML = labels.map(dept => {
    const color = DEPT_CONFIG[dept] ? DEPT_CONFIG[dept].color : "#94a3b8";
    return `
      <div class="analytics-badge-pill">
        <span class="pill-dot" style="background-color: ${color};"></span>
        <span>${escapeHTML(dept)}: <strong>${counts[dept]}</strong></span>
      </div>
    `;
  }).join("");

  const cfg = getChartThemeSettings();

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.data.datasets[0].backgroundColor = bgColors;
    chartInstance.data.datasets[0].borderColor = borderColors;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Students",
        data: data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 6,
        maxBarThickness: 42
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: c => ` ${c.parsed.y} enrolled student${c.parsed.y === 1 ? "" : "s"}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: cfg.gridColor, drawBorder: false },
          ticks: { color: cfg.textColor, font: { family: "Plus Jakarta Sans", size: 11, weight: 600 } }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: cfg.textColor, font: { family: "Plus Jakarta Sans", size: 10 } },
          grid: { color: cfg.gridColor, drawBorder: false }
        }
      }
    }
  });
}

/* ==========================================================================
   Real-Time Form Validation Engine
   ========================================================================== */

// 1. Name: ONLY alphabets and single spaces allowed
el.nameInput.addEventListener("input", () => {
  // Automatically strip any numbers, punctuation, or symbols
  el.nameInput.value = el.nameInput.value.replace(/[^A-Za-z\s]/g, "");

  const val = el.nameInput.value.trim();
  const wrap = el.nameInput.closest(".input-field-wrap");

  if (!val) {
    wrap.className = "input-field-wrap";
    el.nameFeedback.textContent = "";
    el.nameError.classList.add("hidden");
    return;
  }

  if (VALIDATION.nameRegex.test(val)) {
    wrap.className = "input-field-wrap field-valid";
    el.nameFeedback.textContent = "✓";
    el.nameError.classList.add("hidden");
  } else {
    wrap.className = "input-field-wrap field-invalid";
    el.nameFeedback.textContent = "✕";
    el.nameError.textContent = "Name must be at least 2 alphabetic letters.";
    el.nameError.classList.remove("hidden");
  }
});

// 2. USN: Must strictly follow 1RV format (e.g. 1RV24CS001)
el.usnInput.addEventListener("input", () => {
  // Uppercase and strip special characters
  el.usnInput.value = el.usnInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const val = el.usnInput.value.trim();
  const wrap = el.usnInput.closest(".input-field-wrap");

  if (!val) {
    wrap.className = "input-field-wrap";
    el.usnFeedback.textContent = "";
    el.usnError.classList.add("hidden");
    return;
  }

  // Check if it starts with 1RV
  if (!val.startsWith("1RV")) {
    wrap.className = "input-field-wrap field-invalid";
    el.usnFeedback.textContent = "✕";
    el.usnError.textContent = "USN must begin with '1RV' (e.g. 1RV24CS001).";
    el.usnError.classList.remove("hidden");
    return;
  }

  if (VALIDATION.usnRegex.test(val)) {
    wrap.className = "input-field-wrap field-valid";
    el.usnFeedback.textContent = "✓";
    el.usnError.classList.add("hidden");
  } else {
    wrap.className = "input-field-wrap field-invalid";
    el.usnFeedback.textContent = "✕";
    el.usnError.textContent = "Must follow format: 1RV + Year (2 digits) + Branch + Roll (e.g. 1RV24CS001).";
    el.usnError.classList.remove("hidden");
  }
});

// 3. Email: Standard email validation
el.emailInput.addEventListener("input", () => {
  const val = el.emailInput.value.trim().toLowerCase();
  const wrap = el.emailInput.closest(".input-field-wrap");

  if (!val) {
    wrap.className = "input-field-wrap";
    el.emailFeedback.textContent = "";
    el.emailError.classList.add("hidden");
    return;
  }

  if (VALIDATION.emailRegex.test(val)) {
    wrap.className = "input-field-wrap field-valid";
    el.emailFeedback.textContent = "✓";
    el.emailError.classList.add("hidden");
  } else {
    wrap.className = "input-field-wrap field-invalid";
    el.emailFeedback.textContent = "✕";
    el.emailError.textContent = "Please enter a valid email address (e.g. name@rvce.edu.in).";
    el.emailError.classList.remove("hidden");
  }
});

// 4. Phone: Digits and phone symbols only
el.phoneInput.addEventListener("input", () => {
  el.phoneInput.value = el.phoneInput.value.replace(/[^0-9+\s\-()]/g, "");
});

function validateFormBeforeSubmit() {
  const name = el.nameInput.value.trim();
  const usn = el.usnInput.value.trim().toUpperCase();
  const email = el.emailInput.value.trim().toLowerCase();
  const department = el.departmentInput.value;
  const semester = Number(el.semesterInput.value);

  if (!name || !VALIDATION.nameRegex.test(name)) {
    el.nameError.textContent = "Please enter a valid student name (letters only, min 2 characters).";
    el.nameError.classList.remove("hidden");
    el.nameInput.focus();
    return false;
  }

  if (!usn.startsWith("1RV")) {
    el.usnError.textContent = "USN must begin with '1RV'.";
    el.usnError.classList.remove("hidden");
    el.usnInput.focus();
    return false;
  }

  if (!VALIDATION.usnRegex.test(usn)) {
    el.usnError.textContent = "USN format invalid. Example: 1RV24CS001 or 1RV25CS205.";
    el.usnError.classList.remove("hidden");
    el.usnInput.focus();
    return false;
  }

  if (!VALIDATION.emailRegex.test(email)) {
    el.emailError.textContent = "Please provide a valid email address.";
    el.emailError.classList.remove("hidden");
    el.emailInput.focus();
    return false;
  }

  if (!department) {
    showFormError("Please select an academic department.");
    el.departmentInput.focus();
    return false;
  }

  if (isNaN(semester) || semester < 1 || semester > 8) {
    showFormError("Please select a valid semester (1 to 8).");
    el.semesterInput.focus();
    return false;
  }

  return true;
}

function showFormError(msg) {
  el.formAlertBox.textContent = msg;
  el.formAlertBox.classList.remove("hidden");
}

/* ==========================================================================
   Add / Edit Modal Dialog
   ========================================================================== */

function openAddDialog() {
  el.studentForm.reset();
  el.studentId.value = "";
  el.dialogTitle.textContent = "Add New Student";
  el.dialogHeaderPill.textContent = "NEW RECORD";
  el.submitBtnText.textContent = "Save Record";
  resetFieldStates();
  el.studentDialog.showModal();
}

function openEditDialog(student) {
  el.studentForm.reset();
  el.studentId.value = student._id;
  el.nameInput.value = student.name || "";
  el.usnInput.value = student.usn || "";
  el.emailInput.value = student.email || "";
  el.departmentInput.value = student.department || "";
  el.semesterInput.value = String(student.semester || "");
  el.phoneInput.value = student.phone || "";

  el.dialogTitle.textContent = "Edit Student Profile";
  el.dialogHeaderPill.textContent = "MODIFY RECORD";
  el.submitBtnText.textContent = "Update Record";
  resetFieldStates();

  // Trigger input validations so valid states appear immediately
  el.nameInput.dispatchEvent(new Event("input"));
  el.usnInput.dispatchEvent(new Event("input"));
  el.emailInput.dispatchEvent(new Event("input"));

  el.studentDialog.showModal();
}

function resetFieldStates() {
  document.querySelectorAll(".input-field-wrap").forEach(w => w.className = "input-field-wrap");
  document.querySelectorAll(".field-feedback").forEach(f => f.textContent = "");
  document.querySelectorAll(".field-error-msg").forEach(e => e.classList.add("hidden"));
  el.formAlertBox.classList.add("hidden");
  el.formAlertBox.textContent = "";
}

function closeStudentDialog() {
  el.studentDialog.close();
}

el.closeDialogBtn.addEventListener("click", closeStudentDialog);
el.cancelFormBtn.addEventListener("click", closeStudentDialog);
el.studentDialog.addEventListener("click", e => {
  if (e.target === el.studentDialog) closeStudentDialog();
});

// Form Submit Handler
el.studentForm.addEventListener("submit", async event => {
  event.preventDefault();
  el.formAlertBox.classList.add("hidden");

  if (!validateFormBeforeSubmit()) return;

  const id = el.studentId.value;
  const payload = {
    name: el.nameInput.value.trim(),
    usn: el.usnInput.value.trim().toUpperCase(),
    email: el.emailInput.value.trim().toLowerCase(),
    department: el.departmentInput.value,
    semester: Number(el.semesterInput.value),
    phone: el.phoneInput.value.trim()
  };

  el.submitStudentBtn.disabled = true;
  el.submitSpinner.classList.remove("hidden");
  el.submitBtnText.textContent = id ? "Updating..." : "Saving...";

  try {
    const res = await apiRequest(id ? `/students/${id}` : "/students", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });

    closeStudentDialog();
    showToast(id ? "Record Updated" : "Student Enrolled", res.message || "Saved successfully!", "success");
    await fetchStudents();
  } catch (err) {
    showFormError(err.message);
  } finally {
    el.submitStudentBtn.disabled = false;
    el.submitSpinner.classList.add("hidden");
    el.submitBtnText.textContent = id ? "Update Record" : "Save Record";
  }
});

/* ==========================================================================
   View Student Profile Modal
   ========================================================================== */

function openViewModal(student) {
  el.profileAvatar.textContent = getInitials(student.name);
  el.profileAvatar.style.background = getAvatarColor(student.name);
  el.profileName.textContent = student.name;
  el.profileUsn.textContent = student.usn;
  el.profileDept.textContent = student.department;

  const deptInfo = DEPT_CONFIG[student.department] || DEFAULT_DEPT;
  el.profileDept.className = `profile-pill-dept ${deptInfo.class}`;

  const semYear = getSemesterYearText(student.semester);
  el.profileSemester.textContent = `Semester ${student.semester} (${semYear})`;
  el.profileEmail.textContent = student.email;

  if (student.phone) {
    el.profilePhone.textContent = student.phone;
    el.profilePhoneCopy.classList.remove("hidden");
  } else {
    el.profilePhone.textContent = "Not specified";
    el.profilePhoneCopy.classList.add("hidden");
  }

  el.profileCreated.textContent = student.createdAt ? new Date(student.createdAt).toLocaleString() : "—";

  el.profileEditBtn.onclick = () => {
    el.viewDetailsDialog.close();
    openEditDialog(student);
  };

  el.profileDeleteBtn.onclick = () => {
    el.viewDetailsDialog.close();
    openDeleteDialog(student);
  };

  el.viewDetailsDialog.showModal();
}

function getSemesterYearText(sem) {
  const n = Number(sem);
  if (n <= 2) return "1st Year";
  if (n <= 4) return "2nd Year";
  if (n <= 6) return "3rd Year";
  return "4th Year";
}

el.closeProfileBtn.addEventListener("click", () => el.viewDetailsDialog.close());
el.viewDetailsDialog.addEventListener("click", e => {
  if (e.target === el.viewDetailsDialog) el.viewDetailsDialog.close();
});

// Copy button in Profile
document.querySelectorAll(".icon-copy-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const targetId = btn.dataset.copy;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    const text = targetEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to Clipboard", text, "info", 1800);
    } catch {
      showToast("Copy Failed", "Unable to copy text", "error");
    }
  });
});

/* ==========================================================================
   Delete Confirmation Dialog
   ========================================================================== */

function openDeleteDialog(student) {
  studentToDelete = student;
  el.deleteTargetName.textContent = student.name;
  el.deleteTargetUsn.textContent = student.usn;
  el.confirmDeleteBtn.disabled = false;
  el.deleteSpinner.classList.add("hidden");
  el.deleteBtnLabel.textContent = "Delete Record";
  el.deleteConfirmDialog.showModal();
}

function closeDeleteDialog() {
  el.deleteConfirmDialog.close();
  studentToDelete = null;
}

el.cancelDeleteBtn.addEventListener("click", closeDeleteDialog);
el.deleteConfirmDialog.addEventListener("click", e => {
  if (e.target === el.deleteConfirmDialog) closeDeleteDialog();
});

el.confirmDeleteBtn.addEventListener("click", async () => {
  if (!studentToDelete) return;

  el.confirmDeleteBtn.disabled = true;
  el.deleteSpinner.classList.remove("hidden");
  el.deleteBtnLabel.textContent = "Deleting...";

  try {
    const res = await apiRequest(`/students/${studentToDelete._id}`, { method: "DELETE" });
    closeDeleteDialog();
    showToast("Student Removed", res.message || "Record permanently deleted.", "success");
    await fetchStudents();
  } catch (err) {
    showToast("Delete Failed", err.message, "error");
    el.confirmDeleteBtn.disabled = false;
    el.deleteSpinner.classList.add("hidden");
    el.deleteBtnLabel.textContent = "Delete Record";
  }
});

/* ==========================================================================
   Action Delegations (Table & Grid)
   ========================================================================== */

function handleStudentAction(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;
  const student = studentsList.find(s => s._id === id);
  if (!student) return;

  if (action === "view") openViewModal(student);
  if (action === "edit") openEditDialog(student);
  if (action === "delete") openDeleteDialog(student);
}

el.studentsTableBody.addEventListener("click", handleStudentAction);
el.gridViewContainer.addEventListener("click", handleStudentAction);

/* ==========================================================================
   CSV Export
   ========================================================================== */

function exportCSV() {
  const exportData = filteredList.length > 0 ? filteredList : studentsList;
  if (!exportData || exportData.length === 0) {
    showToast("Export Failed", "No student records available to export.", "error");
    return;
  }

  const headers = ["Full Name", "USN", "Department", "Semester", "Email", "Phone", "Date Enrolled"];
  const rows = exportData.map(s => [
    `"${(s.name || "").replace(/"/g, '""')}"`,
    `"${(s.usn || "").replace(/"/g, '""')}"`,
    `"${(s.department || "").replace(/"/g, '""')}"`,
    `"${s.semester || ""}"`,
    `"${(s.email || "").replace(/"/g, '""')}"`,
    `"${(s.phone || "").replace(/"/g, '""')}"`,
    `"${formatDisplayDate(s.createdAt)}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `campuscore-students-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("CSV Exported", `Successfully exported ${exportData.length} student records.`, "success");
}

el.topExportBtn.addEventListener("click", exportCSV);
el.sidebarExportBtn.addEventListener("click", exportCSV);
el.footerDownloadBtn.addEventListener("click", exportCSV);

/* ==========================================================================
   Header & Search Event Listeners
   ========================================================================== */

el.topAddBtn.addEventListener("click", openAddDialog);
el.sidebarAddBtn.addEventListener("click", openAddDialog);

// Live Debounced Search
el.topSearchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchStudents();
  }, 280);
});

// Keyboard shortcut '/' to focus search
document.addEventListener("keydown", e => {
  if (e.key === "/" && document.activeElement !== el.topSearchInput && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
    e.preventDefault();
    el.topSearchInput.focus();
  }
});

// Dropdown Filters
el.departmentFilter.addEventListener("change", fetchStudents);
el.semesterFilter.addEventListener("change", fetchStudents);
el.sortBy.addEventListener("change", () => {
  applySorting();
  renderDirectory();
});

// Refresh Button
el.refreshBtn.addEventListener("click", () => {
  fetchStudents();
  showToast("Directory Refreshed", "Loaded latest student records", "info", 1500);
});

// Mobile Sidebar Toggle
el.menuToggleBtn.addEventListener("click", () => {
  el.appSidebar.classList.toggle("open");
});

document.addEventListener("click", e => {
  if (window.innerWidth <= 1024 && !el.appSidebar.contains(e.target) && !el.menuToggleBtn.contains(e.target)) {
    el.appSidebar.classList.remove("open");
  }
});

/* ==========================================================================
   App Bootstrap
   ========================================================================== */

window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setViewMode(currentViewMode);
  updateSystemClock();
  setInterval(updateSystemClock, 60000);
  checkApiPing();
  fetchStudents();
});
