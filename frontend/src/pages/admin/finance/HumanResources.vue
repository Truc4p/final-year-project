<!-- src/pages/admin/HumanResources.vue -->
<script setup>
import axios from "axios";
import { onMounted, ref, computed, watch } from "vue";
import { Bar, Doughnut, Line } from 'vue-chartjs';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { API_URL } from '../../../utils/config';
import AdminChatWidget from '../../../components/AdminChatWidget.vue';

const { t } = useI18n();
const router = useRouter();

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

// Data refs
const employees = ref([]);
const hrAnalytics = ref({});
const departmentStats = ref([]);
const payrollSummary = ref({});
const loading = ref(true);
const error = ref(null);

// UI state
const activeTab = ref('dashboard');
const selectedDepartment = ref('');
const selectedStatus = ref('');
const searchQuery = ref('');
const showEmployeeModal = ref(false);
const editingEmployee = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalPages = ref(1);

// Form data for new/edit employee
const employeeForm = ref({
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  },
  department: 'engineering',
  position: '',
  employmentType: 'full_time',
  status: 'active',
  salary: {
    amount: '',
    currency: 'USD',
    payFrequency: 'monthly'
  },
  startDate: '',
  endDate: '',
  manager: '',
  skills: [],
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
    email: ''
  },
  leaveBalance: {
    vacation: 20,
    sick: 10,
    personal: 5
  },
  benefits: {
    healthInsurance: false,
    dentalInsurance: false,
    retirementPlan: false,
    lifeInsurance: false
  },
  notes: ''
});

// Options
const departments = [
  { value: 'engineering', label: 'Engineering', icon: '💻' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'sales', label: 'Sales', icon: '💰' },
  { value: 'finance', label: 'Finance', icon: '📊' },
  { value: 'hr', label: 'Human Resources', icon: '👥' },
  { value: 'operations', label: 'Operations', icon: '⚙️' },
  { value: 'customer_service', label: 'Customer Service', icon: '🎧' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'management', label: 'Management', icon: '👔' }
];

const employmentTypes = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' }
];

const statusOptions = [
  { value: 'active', label: 'Active', class: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
  { value: 'terminated', label: 'Terminated', class: 'bg-red-100 text-red-800' },
  { value: 'on_leave', label: 'On Leave', class: 'bg-yellow-100 text-yellow-800' }
];

const payFrequencies = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

// Computed properties
const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const matchesSearch = !searchQuery.value ||
      emp.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesDepartment = !selectedDepartment.value || emp.department === selectedDepartment.value;
    const matchesStatus = !selectedStatus.value || emp.status === selectedStatus.value;

    return matchesSearch && matchesDepartment && matchesStatus;
  });
});

const departmentChartData = computed(() => {
  if (!hrAnalytics.value.departmentBreakdown) return { labels: [], datasets: [] };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899'];

  return {
    labels: hrAnalytics.value.departmentBreakdown.map(dept =>
      departments.find(d => d.value === dept._id)?.label || dept._id
    ),
    datasets: [
      {
        data: hrAnalytics.value.departmentBreakdown.map(dept => dept.count),
        backgroundColor: colors.slice(0, hrAnalytics.value.departmentBreakdown.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };
});

const payrollChartData = computed(() => {
  if (!departmentStats.value.length) return { labels: [], datasets: [] };

  return {
    labels: departmentStats.value.map(dept =>
      departments.find(d => d.value === dept.department)?.label || dept.department
    ),
    datasets: [
      {
        label: 'Total Salary ($)',
        data: departmentStats.value.map(dept => dept.totalSalary),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 1
      }
    ]
  };
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true }
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.label}: ${context.parsed}`
      }
    }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      ticks: {
        callback: (value) => `$${value.toLocaleString()}`
      }
    }
  }
};

// API functions
const fetchEmployees = async () => {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: itemsPerPage.value
    });

    if (selectedDepartment.value) params.append('department', selectedDepartment.value);
    if (selectedStatus.value) params.append('status', selectedStatus.value);

    const response = await axios.get(`${API_URL}/hr/employees?${params}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    employees.value = response.data.employees;
    totalPages.value = response.data.totalPages;
  } catch (err) {
    console.error("Error fetching employees:", err);
    handleAuthError(err);
  }
};

const fetchHRAnalytics = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/hr/analytics`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    hrAnalytics.value = response.data;
  } catch (err) {
    console.error("Error fetching HR analytics:", err);
    handleAuthError(err);
  }
};

const fetchDepartmentStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/hr/department-stats`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    departmentStats.value = response.data;
  } catch (err) {
    console.error("Error fetching department stats:", err);
    handleAuthError(err);
  }
};

const fetchPayrollSummary = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/hr/payroll-summary`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    payrollSummary.value = response.data;
  } catch (err) {
    console.error("Error fetching payroll summary:", err);
    handleAuthError(err);
  }
};

// Handle authentication errors
const handleAuthError = (err) => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    localStorage.removeItem('token');
    router.push('/login');
  }
};

// Form handling
const openEmployeeModal = (employee = null) => {
  if (employee) {
    editingEmployee.value = employee;
    employeeForm.value = {
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      address: employee.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      department: employee.department,
      position: employee.position,
      employmentType: employee.employmentType,
      status: employee.status,
      salary: {
        amount: employee.salary.amount,
        currency: employee.salary.currency,
        payFrequency: employee.salary.payFrequency
      },
      startDate: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : '',
      endDate: employee.endDate ? new Date(employee.endDate).toISOString().split('T')[0] : '',
      manager: employee.manager?._id || '',
      skills: employee.skills || [],
      emergencyContact: employee.emergencyContact || {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      leaveBalance: employee.leaveBalance || {
        vacation: 20,
        sick: 10,
        personal: 5
      },
      benefits: employee.benefits || {
        healthInsurance: false,
        dentalInsurance: false,
        retirementPlan: false,
        lifeInsurance: false
      },
      notes: employee.notes || ''
    };
  } else {
    editingEmployee.value = null;
    employeeForm.value = {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      department: 'engineering',
      position: '',
      employmentType: 'full_time',
      status: 'active',
      salary: {
        amount: '',
        currency: 'USD',
        payFrequency: 'monthly'
      },
      startDate: '',
      endDate: '',
      manager: '',
      skills: [],
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      leaveBalance: {
        vacation: 20,
        sick: 10,
        personal: 5
      },
      benefits: {
        healthInsurance: false,
        dentalInsurance: false,
        retirementPlan: false,
        lifeInsurance: false
      },
      notes: ''
    };
  }
  showEmployeeModal.value = true;
};

const closeEmployeeModal = () => {
  showEmployeeModal.value = false;
  editingEmployee.value = null;
};

const saveEmployee = async () => {
  try {
    // Clear any previous errors
    error.value = null;

    const token = localStorage.getItem("token");
    const employeeData = {
      ...employeeForm.value,
      salary: {
        ...employeeForm.value.salary,
        amount: parseFloat(employeeForm.value.salary.amount)
      }
    };

    // Clean empty manager field - don't send empty strings
    if (employeeData.manager === '' || employeeData.manager === null) {
      delete employeeData.manager;
    }

    if (editingEmployee.value) {
      // Update existing employee
      await axios.put(`${API_URL}/hr/employees/${editingEmployee.value._id}`, employeeData, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      alert('Employee updated successfully!');
    } else {
      // Create new employee
      await axios.post(`${API_URL}/hr/employees`, employeeData, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      alert('Employee created successfully!');
    }

    closeEmployeeModal();
    await fetchAllData();
  } catch (err) {
    console.error("Error saving employee:", err);

    // Handle specific error types
    if (err.response?.status === 400 && err.response?.data?.field) {
      // Handle duplicate key errors with specific field information
      const { message, field, value } = err.response.data;
      alert(`Error: ${message}`);
      // Don't set error.value for field-specific errors to avoid UI blocking
    } else {
      const errorMessage = err.response?.data?.message || "Failed to save employee";
      alert(`Error: ${errorMessage}`);
      // Only set error.value for serious errors that should block the UI
      if (err.response?.status >= 500) {
        error.value = errorMessage;
      }
    }
  }
};

const deleteEmployee = async (employeeId) => {
  if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;

  try {
    error.value = null; // Clear any previous errors
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/hr/employees/${employeeId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    alert('Employee deleted successfully!');
    await fetchAllData();
  } catch (err) {
    console.error("Error deleting employee:", err);
    const errorMessage = err.response?.data?.message || "Failed to delete employee";
    alert(`Error: ${errorMessage}`);
    // Only set error.value for serious errors
    if (err.response?.status >= 500) {
      error.value = errorMessage;
    }
  }
};

// Fetch all data
const fetchAllData = async () => {
  loading.value = true;
  error.value = null; // Clear any previous errors
  try {
    await Promise.all([
      fetchEmployees(),
      fetchHRAnalytics(),
      fetchDepartmentStats(),
      fetchPayrollSummary()
    ]);
    // Data loaded successfully, ensure error is cleared
    error.value = null;
  } catch (err) {
    error.value = "Failed to load HR data";
    console.error("Error loading HR data:", err);
  } finally {
    loading.value = false;
  }
};

// Clear error function
const clearError = () => {
  error.value = null;
};

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusClass = (status) => {
  return statusOptions.find(opt => opt.value === status)?.class || 'bg-gray-100 text-gray-800';
};

const getDepartmentIcon = (department) => {
  return departments.find(dept => dept.value === department)?.icon || '👤';
};

const addSkill = () => {
  const skillInput = document.getElementById('skillInput');
  const skill = skillInput.value.trim();
  if (skill && !employeeForm.value.skills.includes(skill)) {
    employeeForm.value.skills.push(skill);
    skillInput.value = '';
  }
};

const removeSkill = (index) => {
  employeeForm.value.skills.splice(index, 1);
};

const getYearsOfService = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  return Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000));
};

// Pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You need to login first");
    router.push("/login");
    return;
  }

  await fetchAllData();
});

// Watch for filter changes
watch([selectedDepartment, selectedStatus, currentPage], fetchEmployees);
</script>

<template>
  <div class="page-background min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary-600 mb-2">Human Resource Management</h1>
        <p class="text-secondary-600 text-lg">Comprehensive employee management, analytics, and organizational insights
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card p-8 text-center">
        <div class="text-red-600 text-lg font-medium mb-2">{{ error }}</div>
        <p class="text-secondary-500 mb-4">Please try refreshing the page or clear this error</p>
        <div class="flex justify-center gap-4">
          <button @click="clearError" class="btn btn-primary">
            Clear Error
          </button>
          <button @click="fetchAllData" class="btn bg-gray-500 hover:bg-gray-600 text-white">
            Retry Loading
          </button>
        </div>
      </div>

      <!-- HR Content -->
      <div v-else class="space-y-8">
        <!-- Tab Navigation -->
        <div class="card">
          <div class="border-b border-gray-200">
            <nav class="flex space-x-8 px-6" aria-label="Tabs">
              <button v-for="tab in [
                { id: 'dashboard', name: 'Dashboard & Analytics', icon: '📊' },
                { id: 'employees', name: 'Employee Directory', icon: '👥' },
                { id: 'departments', name: 'Departments', icon: '🏢' },
                { id: 'payroll', name: 'Payroll', icon: '💰' }
              ]" :key="tab.id" @click="activeTab = tab.id" :class="[
                'py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]">
                <span>{{ tab.icon }}</span>
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Dashboard & Analytics Tab -->
            <div v-if="activeTab === 'dashboard'" class="space-y-8">
              <!-- Key HR Metrics -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Employees -->
                <div class="card p-6 border-l-4 border-blue-500">
                  <div class="flex items-center">
                    <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                        </path>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-secondary-600">Total Employees</p>
                      <p class="text-2xl font-bold text-blue-600">{{ hrAnalytics.overview?.totalEmployees || 0 }}</p>
                    </div>
                  </div>
                </div>

                <!-- Active Employees -->
                <div class="card p-6 border-l-4 border-green-500">
                  <div class="flex items-center">
                    <div class="p-3 rounded-full bg-green-100 text-green-600">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                        </path>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-secondary-600">Active Employees</p>
                      <p class="text-2xl font-bold text-green-600">{{ hrAnalytics.overview?.activeEmployees || 0 }}</p>
                    </div>
                  </div>
                </div>

                <!-- Total Payroll -->
                <div class="card p-6 border-l-4 border-purple-500">
                  <div class="flex items-center">
                    <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1">
                        </path>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-secondary-600">Monthly Payroll</p>
                      <p class="text-2xl font-bold text-purple-600">{{
                        formatCurrency(payrollSummary.totalMonthlyPayroll) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Average Salary -->
                <div class="card p-6 border-l-4 border-orange-500">
                  <div class="flex items-center">
                    <div class="p-3 rounded-full bg-orange-100 text-orange-600">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6">
                        </path>
                      </svg>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-medium text-secondary-600">Average Salary</p>
                      <p class="text-2xl font-bold text-orange-600">{{
                        formatCurrency(hrAnalytics.overview?.averageSalary) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Charts and Analytics Row -->
              <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <!-- Department Breakdown Chart -->
                <div class="card p-6">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">🏢 Employee Distribution by Department</h4>
                  <div v-if="hrAnalytics.departmentBreakdown?.length > 0" class="h-64">
                    <Doughnut :data="departmentChartData" :options="chartOptions" />
                  </div>
                  <div v-else class="text-center py-8 text-gray-500">
                    <p>No department data available</p>
                  </div>
                </div>

                <!-- Employment Type & Status -->
                <div class="card p-6">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">👔 Employment Analysis</h4>
                  <div class="space-y-4">
                    <!-- Employment Types -->
                    <div>
                      <h5 class="text-sm font-semibold text-gray-700 mb-2">Employment Types</h5>
                      <div v-if="hrAnalytics.employmentTypeBreakdown?.length > 0" class="space-y-2">
                        <div v-for="type in hrAnalytics.employmentTypeBreakdown" :key="type._id"
                          class="flex items-center justify-between">
                          <div class="flex items-center">
                            <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span class="text-xs font-medium">{{employmentTypes.find(t => t.value === type._id)?.label
                              || type._id}}</span>
                          </div>
                          <div class="text-xs font-bold text-blue-600">{{ type.count }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Employee Status -->
                    <div class="border-t pt-3">
                      <h5 class="text-sm font-semibold text-gray-700 mb-2">Employee Status</h5>
                      <div class="space-y-2">
                        <div v-for="status in statusOptions" :key="status.value"
                          class="flex items-center justify-between">
                          <div class="flex items-center">
                            <div :class="['w-3 h-3 rounded-full mr-2',
                              status.value === 'active' ? 'bg-green-500' :
                                status.value === 'inactive' ? 'bg-gray-500' :
                                  status.value === 'terminated' ? 'bg-red-500' : 'bg-yellow-500'
                            ]"></div>
                            <span class="text-xs font-medium">{{ status.label }}</span>
                          </div>
                          <div class="text-xs font-bold" :class="status.value === 'active' ? 'text-green-600' :
                            status.value === 'inactive' ? 'text-gray-600' :
                              status.value === 'terminated' ? 'text-red-600' : 'text-yellow-600'">
                            {{employees.filter(emp => emp.status === status.value).length}}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Payroll by Department Chart -->
                <div class="card p-6">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">💰 Department Payroll</h4>
                  <div v-if="departmentStats.length > 0" class="h-64">
                    <Bar :data="payrollChartData" :options="barChartOptions" />
                  </div>
                  <div v-else class="text-center py-8 text-gray-500">
                    <p>No payroll data available</p>
                  </div>
                </div>
              </div>

              <!-- Detailed Analytics -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Tenure & Salary Analysis -->
                <div class="card p-6">
                  <h4 class="text-lg font-semibold text-secondary-900 mb-4">📈 Workforce Analytics</h4>
                  <div class="space-y-4">
                    <!-- Tenure Distribution -->
                    <div>
                      <h5 class="text-sm font-semibold text-gray-700 mb-2">⏱️ Tenure Distribution</h5>
                      <div class="space-y-2">
                        <div v-for="range in [
                          { label: '< 1 year', min: 0, max: 1, color: 'bg-red-400' },
                          { label: '1-3 years', min: 1, max: 3, color: 'bg-yellow-400' },
                          { label: '3-5 years', min: 3, max: 6, color: 'bg-blue-400' },
                          { label: '5+ years', min: 5, max: 999, color: 'bg-green-400' }
                        ]" :key="range.label" class="flex items-center justify-between">
                          <div class="flex items-center">
                            <div :class="['w-3 h-3 rounded-full mr-2', range.color]"></div>
                            <span class="text-xs font-medium">{{ range.label }}</span>
                          </div>
                          <div class="text-xs font-bold text-gray-800">
                            {{employees.filter(emp => {
                              const years = getYearsOfService(emp.startDate);
                              return years >= range.min && years < range.max;
                            }).length}} </div>
                          </div>
                        </div>
                      </div>

                      <!-- Salary Range -->
                      <div class="border-t pt-3">
                        <h5 class="text-sm font-semibold text-gray-700 mb-2">💰 Salary Distribution</h5>
                        <div class="space-y-2">
                          <div v-for="range in [
                            { label: '< $50K', min: 0, max: 50000, color: 'bg-red-400' },
                            { label: '$50K - $75K', min: 50000, max: 75000, color: 'bg-yellow-400' },
                            { label: '$75K - $100K', min: 75000, max: 100000, color: 'bg-blue-400' },
                            { label: '$100K+', min: 100000, max: 999999999, color: 'bg-green-400' }
                          ]" :key="range.label" class="flex items-center justify-between">
                            <div class="flex items-center">
                              <div :class="['w-3 h-3 rounded-full mr-2', range.color]"></div>
                              <span class="text-xs font-medium">{{ range.label }}</span>
                            </div>
                            <div class="text-xs font-bold text-gray-800">
                              {{employees.filter(emp => {
                                const salary = emp.salary?.amount || 0;
                                return salary >= range.min && salary < range.max;
                              }).length}} </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Department Analysis Table -->
                    <div class="card p-6">
                      <h4 class="text-lg font-semibold text-secondary-900 mb-4">🏢 Department Performance</h4>
                      <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                          <thead>
                            <tr class="border-b border-gray-200">
                              <th class="text-left py-2 font-medium text-gray-700">Dept</th>
                              <th class="text-right py-2 font-medium text-gray-700">Count</th>
                              <th class="text-right py-2 font-medium text-gray-700">Avg Salary</th>
                              <th class="text-right py-2 font-medium text-gray-700">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="dept in departmentStats.slice(0, 6)" :key="dept.department"
                              class="border-b border-gray-100">
                              <td class="py-2">
                                <div class="flex items-center">
                                  <span class="mr-1 text-sm">{{ getDepartmentIcon(dept.department) }}</span>
                                  <span class="text-xs font-medium truncate">
                                    {{departments.find(d => d.value === dept.department)?.label?.substring(0, 10) ||
                                      dept.department}}
                                  </span>
                                </div>
                              </td>
                              <td class="text-right py-2 font-semibold text-xs">{{ dept.employeeCount }}</td>
                              <td class="text-right py-2 text-xs">{{ formatCurrency(dept.averageSalary).replace('$',
                                '$').replace(',', 'K').replace('000', '') }}</td>
                              <td class="text-right py-2 text-xs">
                                {{ Math.round((dept.employeeCount / (hrAnalytics.overview?.totalEmployees || 1)) * 100)
                                }}%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- Recent Activities -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Recent Hires -->
                    <div class="card p-6">
                      <h4 class="text-lg font-semibold text-secondary-900 mb-4">🆕 Recent Hires (Last 30 days)</h4>
                      <div v-if="hrAnalytics.recentHires?.length > 0" class="space-y-3 max-h-64 overflow-y-auto">
                        <div v-for="employee in hrAnalytics.recentHires" :key="employee._id"
                          class="border border-gray-200 rounded-lg p-4">
                          <div class="flex items-center justify-between">
                            <div>
                              <div class="font-medium text-gray-900">{{ employee.firstName }} {{ employee.lastName }}
                              </div>
                              <div class="text-sm text-gray-600">{{ employee.position }} • {{ employee.department }}
                              </div>
                              <div class="text-xs text-gray-500">Started: {{ formatDate(employee.startDate) }}</div>
                            </div>
                            <span class="text-lg">{{ getDepartmentIcon(employee.department) }}</span>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-center py-8 text-gray-500">
                        <p>No recent hires</p>
                      </div>
                    </div>

                    <!-- Upcoming Anniversaries -->
                    <div class="card p-6">
                      <h4 class="text-lg font-semibold text-secondary-900 mb-4">🎉 Upcoming Anniversaries</h4>
                      <div v-if="hrAnalytics.upcomingAnniversaries?.length > 0"
                        class="space-y-3 max-h-64 overflow-y-auto">
                        <div v-for="employee in hrAnalytics.upcomingAnniversaries" :key="employee._id"
                          class="border-l-4 border-purple-400 bg-purple-50 p-4 rounded-r-lg">
                          <div class="flex items-center justify-between">
                            <div>
                              <div class="font-medium text-gray-900">{{ employee.firstName }} {{ employee.lastName }}
                              </div>
                              <div class="text-sm text-gray-600">{{ employee.position }}</div>
                              <div class="text-xs text-purple-600">{{ getYearsOfService(employee.startDate) }} years of
                                service</div>
                            </div>
                            <div class="text-right">
                              <div class="text-sm font-semibold text-purple-600">Anniversary</div>
                              <div class="text-xs text-gray-600">{{ formatDate(employee.startDate) }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-center py-8 text-gray-500">
                        <p>No upcoming anniversaries</p>
                      </div>
                    </div>
                  </div>

                  <!-- Performance Distribution (only show if data exists) -->
                  <div v-if="hrAnalytics.performanceStats?.length > 0" class="card p-6">
                    <h4 class="text-lg font-semibold text-secondary-900 mb-4">⭐ Performance Ratings Distribution</h4>
                    <div class="grid grid-cols-5 gap-4">
                      <div v-for="rating in [1, 2, 3, 4, 5]" :key="rating" class="text-center">
                        <div class="text-2xl font-bold mb-2"
                          :class="rating >= 4 ? 'text-green-600' : rating >= 3 ? 'text-yellow-600' : 'text-red-600'">
                          {{hrAnalytics.performanceStats.find(p => p._id === rating)?.count || 0}}
                        </div>
                        <div class="text-sm text-gray-600">{{ rating }} Star{{ rating !== 1 ? 's' : '' }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Employees Tab -->
                <div v-if="activeTab === 'employees'" class="space-y-6">

                  <!-- Employee Modal -->
                  <div v-if="showEmployeeModal"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    @click="closeEmployeeModal">
                    <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
                      <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-gray-900">
                          {{ editingEmployee ? 'Edit Employee' : 'Add New Employee' }}
                        </h3>
                        <button @click="closeEmployeeModal" class="text-gray-500 hover:text-gray-700">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>

                      <form @submit.prevent="saveEmployee" class="space-y-6">
                        <!-- Basic Information -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <h4 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                              <input v-model="employeeForm.employeeId" type="text" class="form-input w-full"
                                :placeholder="editingEmployee ? '' : 'Auto-generated if empty'">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                              <input v-model="employeeForm.firstName" type="text" class="form-input w-full" required>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                              <input v-model="employeeForm.lastName" type="text" class="form-input w-full" required>
                            </div>
                          </div>

                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                              <input v-model="employeeForm.email" type="email" class="form-input w-full" required>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <input v-model="employeeForm.phone" type="tel" class="form-input w-full">
                            </div>
                          </div>
                        </div>

                        <!-- Employment Details -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <h4 class="text-lg font-semibold text-gray-900 mb-4">Employment Details</h4>
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                              <select v-model="employeeForm.department" class="form-select w-full" required>
                                <option v-for="dept in departments" :key="dept.value" :value="dept.value">
                                  {{ dept.icon }} {{ dept.label }}
                                </option>
                              </select>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                              <input v-model="employeeForm.position" type="text" class="form-input w-full" required>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                              <select v-model="employeeForm.employmentType" class="form-select w-full">
                                <option v-for="type in employmentTypes" :key="type.value" :value="type.value">
                                  {{ type.label }}
                                </option>
                              </select>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select v-model="employeeForm.status" class="form-select w-full">
                                <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                                  {{ status.label }}
                                </option>
                              </select>
                            </div>
                          </div>

                          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                              <input v-model="employeeForm.startDate" type="date" class="form-input w-full" required>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                              <input v-model="employeeForm.endDate" type="date" class="form-input w-full">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                              <select v-model="employeeForm.manager" class="form-select w-full">
                                <option value="">No Manager</option>
                                <option
                                  v-for="emp in employees.filter(e => e.status === 'active' && e._id !== editingEmployee?._id)"
                                  :key="emp._id" :value="emp._id">
                                  {{ emp.firstName }} {{ emp.lastName }} ({{ emp.employeeId }})
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <!-- Salary Information -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <h4 class="text-lg font-semibold text-gray-900 mb-4">Compensation</h4>
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Salary Amount *</label>
                              <input v-model="employeeForm.salary.amount" type="number" step="0.01" min="0"
                                class="form-input w-full" required>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                              <select v-model="employeeForm.salary.currency" class="form-select w-full">
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                              </select>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Pay Frequency</label>
                              <select v-model="employeeForm.salary.payFrequency" class="form-select w-full">
                                <option v-for="freq in payFrequencies" :key="freq.value" :value="freq.value">
                                  {{ freq.label }}
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <!-- Skills -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <h4 class="text-lg font-semibold text-gray-900 mb-4">Skills</h4>
                          <div class="flex flex-wrap gap-2 mb-4">
                            <span v-for="(skill, index) in employeeForm.skills" :key="index"
                              class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2">
                              {{ skill }}
                              <button @click="removeSkill(index)" type="button"
                                class="text-blue-600 hover:text-blue-800">
                                ×
                              </button>
                            </span>
                          </div>
                          <div class="flex gap-2">
                            <input id="skillInput" type="text" placeholder="Add a skill..." class="form-input flex-1"
                              @keyup.enter="addSkill">
                            <button @click="addSkill" type="button"
                              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                              Add
                            </button>
                          </div>
                        </div>

                        <!-- Leave Balance -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <h4 class="text-lg font-semibold text-gray-900 mb-4">Leave Balance (Days)</h4>
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Vacation Days</label>
                              <input v-model="employeeForm.leaveBalance.vacation" type="number" min="0"
                                class="form-input w-full">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Sick Days</label>
                              <input v-model="employeeForm.leaveBalance.sick" type="number" min="0"
                                class="form-input w-full">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Personal Days</label>
                              <input v-model="employeeForm.leaveBalance.personal" type="number" min="0"
                                class="form-input w-full">
                            </div>
                          </div>
                        </div>

                        <!-- Benefits -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <h4 class="text-lg font-semibold text-gray-900 mb-4">Benefits</h4>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label class="flex items-center">
                              <input v-model="employeeForm.benefits.healthInsurance" type="checkbox" class="mr-2">
                              <span class="text-sm text-gray-700">Health Insurance</span>
                            </label>
                            <label class="flex items-center">
                              <input v-model="employeeForm.benefits.dentalInsurance" type="checkbox" class="mr-2">
                              <span class="text-sm text-gray-700">Dental Insurance</span>
                            </label>
                            <label class="flex items-center">
                              <input v-model="employeeForm.benefits.retirementPlan" type="checkbox" class="mr-2">
                              <span class="text-sm text-gray-700">Retirement Plan</span>
                            </label>
                            <label class="flex items-center">
                              <input v-model="employeeForm.benefits.lifeInsurance" type="checkbox" class="mr-2">
                              <span class="text-sm text-gray-700">Life Insurance</span>
                            </label>
                          </div>
                        </div>

                        <!-- Emergency Contact -->
                        <div class="border border-gray-200 rounded-lg p-4">
                          <h4 class="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                              <input v-model="employeeForm.emergencyContact.name" type="text" class="form-input w-full">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                              <input v-model="employeeForm.emergencyContact.relationship" type="text"
                                class="form-input w-full">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <input v-model="employeeForm.emergencyContact.phone" type="tel" class="form-input w-full">
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input v-model="employeeForm.emergencyContact.email" type="email"
                                class="form-input w-full">
                            </div>
                          </div>
                        </div>

                        <!-- Notes -->
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea v-model="employeeForm.notes" rows="3" class="form-input w-full"
                            placeholder="Additional notes about the employee..."></textarea>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-3 pt-4 border-t">
                          <button type="button" @click="closeEmployeeModal"
                            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Cancel
                          </button>
                          <button type="submit" class="btn btn-primary">
                            {{ editingEmployee ? 'Update Employee' : 'Create Employee' }}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                  
                  <!-- Employee Management Header -->
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex flex-col md:flex-row gap-4">
                      <!-- Search -->
                      <div class="relative">
                        <input v-model="searchQuery" type="text" placeholder="Search employees..."
                          class="form-input w-full sm:w-96 md:w-[28rem]" style="padding-left:3.5rem; min-width: 280px;">
                        <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 transform"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>

                      <!-- Department Filter -->
                      <select v-model="selectedDepartment" class="form-select w-48">
                        <option value="">All Departments</option>
                        <option v-for="dept in departments" :key="dept.value" :value="dept.value">
                          {{ dept.icon }} {{ dept.label }}
                        </option>
                      </select>

                      <!-- Status Filter -->
                      <select v-model="selectedStatus" class="form-select w-40">
                        <option value="">All Status</option>
                        <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                          {{ status.label }}
                        </option>
                      </select>
                    </div>

                    <button @click="openEmployeeModal()" class="btn btn-primary flex items-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add New Employee
                    </button>
                  </div>

                  <!-- Employees Table -->
                  <div class="card overflow-hidden">
                    <div class="overflow-x-auto">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                          <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Department</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Position</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employment</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Salary</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Start
                              Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions</th>
                          </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="employee in filteredEmployees" :key="employee._id" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                  <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span class="text-sm font-medium text-gray-700">
                                      {{ employee.firstName.charAt(0) }}{{ employee.lastName.charAt(0) }}
                                    </span>
                                  </div>
                                </div>
                                <div class="ml-4">
                                  <div class="text-sm font-medium text-gray-900">{{ employee.firstName }} {{
                                    employee.lastName }}</div>
                                  <div class="text-sm text-gray-500">{{ employee.employeeId }}</div>
                                  <div class="text-sm text-gray-500">{{ employee.email }}</div>
                                </div>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="flex items-center">
                                <span class="text-lg mr-2">{{ getDepartmentIcon(employee.department) }}</span>
                                <span class="text-sm font-medium text-gray-900">
                                  {{departments.find(dept => dept.value === employee.department)?.label ||
                                    employee.department}}
                                </span>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm text-gray-900">{{ employee.position }}</div>
                              <div v-if="employee.manager" class="text-xs text-gray-500">
                                Manager: {{ employee.manager.firstName }} {{ employee.manager.lastName }}
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm text-gray-900">{{employmentTypes.find(type => type.value ===
                                employee.employmentType)?.label}}</div>
                              <div class="text-xs text-gray-500">{{ getYearsOfService(employee.startDate) }} years</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm font-semibold text-gray-900">{{ formatCurrency(employee.salary.amount)
                              }}
                              </div>
                              <div class="text-xs text-gray-500">{{ employee.salary.payFrequency }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <span
                                :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(employee.status)]">
                                {{statusOptions.find(opt => opt.value === employee.status)?.label || employee.status}}
                              </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm text-gray-900">{{ formatDate(employee.startDate) }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button @click="openEmployeeModal(employee)"
                                class="text-indigo-600 hover:text-indigo-900 mr-3">
                                Edit
                              </button>
                              <button @click="deleteEmployee(employee._id)" class="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
                      <div class="text-sm text-gray-700">
                        Page {{ currentPage }} of {{ totalPages }}
                      </div>
                      <div class="flex gap-2">
                        <button @click="prevPage" :disabled="currentPage === 1"
                          class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                          Previous
                        </button>
                        <button @click="nextPage" :disabled="currentPage === totalPages"
                          class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Departments Tab -->
                <div v-if="activeTab === 'departments'" class="space-y-6">
                  <h3 class="text-xl font-semibold text-secondary-900">Department Overview</h3>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="dept in departmentStats" :key="dept.department" class="card p-6">
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                          <span class="text-2xl mr-3">{{ getDepartmentIcon(dept.department) }}</span>
                          <div>
                            <h4 class="text-lg font-semibold text-gray-900">
                              {{departments.find(d => d.value === dept.department)?.label || dept.department}}
                            </h4>
                            <p class="text-sm text-gray-600">{{ dept.employeeCount }} employees</p>
                          </div>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Average Salary:</span>
                          <span class="font-semibold">{{ formatCurrency(dept.averageSalary) }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Total Payroll:</span>
                          <span class="font-semibold">{{ formatCurrency(dept.totalSalary) }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Full-time:</span>
                          <span class="font-semibold">{{ dept.fullTimeCount || 0 }}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                          <span class="text-gray-600">Part-time:</span>
                          <span class="font-semibold">{{ dept.partTimeCount || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Payroll Tab -->
                <div v-if="activeTab === 'payroll'" class="space-y-6">
                  <h3 class="text-xl font-semibold text-secondary-900">Payroll Summary</h3>

                  <!-- Payroll Overview -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card p-6 text-center">
                      <div class="text-2xl font-bold text-green-600 mb-2">{{
                        formatCurrency(payrollSummary.totalMonthlyPayroll) }}</div>
                      <div class="text-sm text-secondary-600">Total Monthly Payroll</div>
                    </div>
                    <div class="card p-6 text-center">
                      <div class="text-2xl font-bold text-blue-600 mb-2">{{ payrollSummary.employeeCount || 0 }}</div>
                      <div class="text-sm text-secondary-600">Active Employees</div>
                    </div>
                    <div class="card p-6 text-center">
                      <div class="text-2xl font-bold text-purple-600 mb-2">
                        {{ payrollSummary.employeeCount > 0 ? formatCurrency(payrollSummary.totalMonthlyPayroll /
                          payrollSummary.employeeCount) : '$0' }}
                      </div>
                      <div class="text-sm text-secondary-600">Average Monthly Salary</div>
                    </div>
                  </div>

                  <!-- Department Payroll Breakdown -->
                  <div class="card p-6">
                    <h4 class="text-lg font-semibold text-secondary-900 mb-4">Department Payroll Breakdown</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div v-for="(amount, department) in payrollSummary.departmentPayroll" :key="department"
                        class="border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center">
                            <span class="text-lg mr-2">{{ getDepartmentIcon(department) }}</span>
                            <span class="font-medium">{{departments.find(d => d.value === department)?.label ||
                              department
                            }}</span>
                          </div>
                          <span class="font-bold text-lg">{{ formatCurrency(amount) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>


        <AdminChatWidget />
      </div>
</template>

<style scoped>
.page-background {
  background: linear-gradient(to bottom right, var(--primary-50), var(--secondary-50));
}

.card {
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid var(--secondary-100);
}

.form-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: white;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-select {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: white;
}

.form-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
</style>
