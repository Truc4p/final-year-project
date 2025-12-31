<template>
  <div class="reports-page">
    <div class="page-header">
      <h1><i class="fas fa-chart-bar"></i> Custom Reports</h1>
      <div class="header-actions">
        <button @click="showNewReportModal = true" class="btn-primary">
          <i class="fas fa-plus"></i> Create Report
        </button>
        <button @click="loadTemplates" class="btn-secondary">
          <i class="fas fa-file-alt"></i> Templates
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <input 
        type="text" 
        v-model="filters.search" 
        @input="loadReports"
        placeholder="Search reports..." 
        class="search-input"
      />
      <select v-model="filters.category" @change="loadReports" class="filter-select">
        <option value="">All Categories</option>
        <option value="financial">Financial</option>
        <option value="sales">Sales</option>
        <option value="expenses">Expenses</option>
        <option value="cash_flow">Cash Flow</option>
        <option value="budget">Budget</option>
        <option value="tax">Tax</option>
        <option value="custom">Custom</option>
      </select>
      <label class="checkbox-label">
        <input type="checkbox" v-model="filters.myReportsOnly" @change="loadReports" />
        My Reports Only
      </label>
      <label class="checkbox-label">
        <input type="checkbox" v-model="filters.templatesOnly" @change="loadReports" />
        Templates
      </label>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Loading reports...
    </div>

    <!-- Reports Grid -->
    <div v-else-if="reports.length > 0" class="reports-grid">
      <div 
        v-for="report in reports" 
        :key="report._id"
        class="report-card"
        @click="viewReport(report)"
      >
        <div class="card-header">
          <h3>{{ report.name }}</h3>
          <div class="card-badges">
            <span v-if="report.isTemplate" class="badge badge-template">
              <i class="fas fa-file-alt"></i> Template
            </span>
            <span v-if="report.isScheduled" class="badge badge-scheduled">
              <i class="fas fa-clock"></i> Scheduled
            </span>
            <span :class="`badge badge-${report.category}`">{{ formatCategory(report.category) }}</span>
          </div>
        </div>

        <p v-if="report.description" class="card-description">{{ report.description }}</p>

        <div class="card-meta">
          <span><i class="fas fa-database"></i> {{ formatDataSource(report.dataSource) }}</span>
          <span><i class="fas fa-chart-line"></i> {{ report.runCount || 0 }} runs</span>
        </div>

        <div class="card-meta">
          <span><i class="fas fa-user"></i> {{ report.createdBy?.username }}</span>
          <span v-if="report.lastRunAt"><i class="fas fa-calendar"></i> {{ formatDate(report.lastRunAt) }}</span>
        </div>

        <div class="card-actions" @click.stop>
          <button @click="runReport(report)" class="btn-icon" title="Run Report">
            <i class="fas fa-play"></i>
          </button>
          <button @click="editReport(report)" class="btn-icon" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="duplicateReport(report)" class="btn-icon" title="Duplicate">
            <i class="fas fa-copy"></i>
          </button>
          <button @click="exportReport(report, 'pdf')" class="btn-icon" title="Export PDF">
            <i class="fas fa-file-pdf"></i>
          </button>
          <button @click="exportReport(report, 'excel')" class="btn-icon" title="Export Excel">
            <i class="fas fa-file-excel"></i>
          </button>
          <button 
            v-if="canDelete(report)"
            @click="deleteReport(report)" 
            class="btn-icon btn-danger" 
            title="Delete"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-chart-bar"></i>
      <h3>No Reports Found</h3>
      <p>Create your first custom report to get started</p>
      <button @click="showNewReportModal = true" class="btn-primary">
        <i class="fas fa-plus"></i> Create Report
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="pagination">
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page === 1"
        class="btn-secondary"
      >
        Previous
      </button>
      <span>Page {{ pagination.page }} of {{ pagination.pages }}</span>
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page === pagination.pages"
        class="btn-secondary"
      >
        Next
      </button>
    </div>

    <!-- New/Edit Report Modal -->
    <ReportBuilderModal
      v-if="showNewReportModal || editingReport"
      :report="editingReport"
      @close="closeReportModal"
      @saved="handleReportSaved"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ReportBuilderModal from './ReportBuilderModal.vue';

const router = useRouter();
const API_URL = 'http://localhost:3000/api/finance/reports';

const reports = ref([]);
const loading = ref(false);
const showNewReportModal = ref(false);
const editingReport = ref(null);

const filters = reactive({
  search: '',
  category: '',
  myReportsOnly: false,
  templatesOnly: false
});

const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0,
  pages: 0
});

const currentUserId = localStorage.getItem('userId');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const loadReports = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search || undefined,
      category: filters.category || undefined,
      isTemplate: filters.templatesOnly || undefined,
      isPublic: filters.myReportsOnly ? false : undefined
    };

    const response = await axios.get(API_URL, { 
      ...getAuthHeaders(),
      params 
    });

    reports.value = response.data.reports;
    Object.assign(pagination, response.data.pagination);
  } catch (error) {
    console.error('Error loading reports:', error);
    alert('Failed to load reports');
  } finally {
    loading.value = false;
  }
};

const runReport = (report) => {
  router.push(`/admin/finance/reports/${report._id}/view`);
};

const viewReport = (report) => {
  router.push(`/admin/finance/reports/${report._id}/view`);
};

const editReport = (report) => {
  editingReport.value = report;
};

const closeReportModal = () => {
  showNewReportModal.value = false;
  editingReport.value = null;
};

const handleReportSaved = () => {
  closeReportModal();
  loadReports();
};

const duplicateReport = async (report) => {
  try {
    await axios.post(`${API_URL}/${report._id}/duplicate`, {}, getAuthHeaders());
    alert('Report duplicated successfully');
    loadReports();
  } catch (error) {
    console.error('Error duplicating report:', error);
    alert(error.response?.data?.message || 'Failed to duplicate report');
  }
};

const exportReport = async (report, format) => {
  try {
    const response = await axios.get(
      `${API_URL}/${report._id}/export/${format}`,
      {
        ...getAuthHeaders(),
        responseType: 'blob'
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.name}.${format === 'excel' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error(`Error exporting ${format}:`, error);
    alert(`Failed to export ${format}`);
  }
};

const deleteReport = async (report) => {
  if (!confirm(`Are you sure you want to delete "${report.name}"?`)) return;

  try {
    await axios.delete(`${API_URL}/${report._id}`, getAuthHeaders());
    alert('Report deleted successfully');
    loadReports();
  } catch (error) {
    console.error('Error deleting report:', error);
    alert(error.response?.data?.message || 'Failed to delete report');
  }
};

const canDelete = (report) => {
  return report.createdBy?._id === currentUserId || report.createdBy === currentUserId;
};

const loadTemplates = () => {
  filters.templatesOnly = true;
  filters.category = '';
  filters.search = '';
  loadReports();
};

const changePage = (page) => {
  pagination.page = page;
  loadReports();
};

const formatCategory = (category) => {
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDataSource = (source) => {
  return source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

onMounted(() => {
  loadReports();
});
</script>

<style scoped>
.reports-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin: 0;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters-bar {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input {
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.2rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1a1a1a;
  flex: 1;
}

.card-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-template { background: #e3f2fd; color: #2196f3; }
.badge-scheduled { background: #fff3e0; color: #ff9800; }
.badge-financial { background: #e8f5e9; color: #4caf50; }
.badge-sales { background: #f3e5f5; color: #9c27b0; }
.badge-expenses { background: #ffebee; color: #f44336; }
.badge-cash_flow { background: #e0f2f1; color: #009688; }
.badge-budget { background: #fff9c4; color: #f57c00; }
.badge-tax { background: #fce4ec; color: #c2185b; }
.badge-custom { background: #f5f5f5; color: #666; }

.card-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
  gap: 1rem;
}

.card-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn-icon {
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #f5f5f5;
  border-color: #bbb;
  color: #333;
}

.btn-icon.btn-danger:hover {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state i {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #666;
}

.empty-state p {
  color: #999;
  margin-bottom: 2rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1976d2;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #d0d0d0;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
