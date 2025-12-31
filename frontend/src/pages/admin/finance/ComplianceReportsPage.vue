<template>
  <div class="compliance-reports-page">
    <div class="page-header">
      <h1 class="page-title">Compliance Reports</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i> New Report
      </button>
    </div>

    <!-- Dashboard Stats -->
    <div v-if="dashboard" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dashboard.totalReports || 0 }}</div>
          <div class="stat-label">Total Reports</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon critical">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ dashboard.criticalFindings || 0 }}</div>
          <div class="stat-label">Critical Findings</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon compliant">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ getCompliantCount() }}</div>
          <div class="stat-label">Compliant</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ getPendingCount() }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input v-model="filters.search" type="text" placeholder="Search reports..." class="search-input" />
      <select v-model="filters.reportType" class="filter-select">
        <option value="">All Types</option>
        <option value="audit_trail">Audit Trail</option>
        <option value="financial_compliance">Financial Compliance</option>
        <option value="tax_compliance">Tax Compliance</option>
        <option value="user_access">User Access</option>
        <option value="security_events">Security Events</option>
      </select>
      <select v-model="filters.status" class="filter-select">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="pending_review">Pending Review</option>
        <option value="reviewed">Reviewed</option>
        <option value="approved">Approved</option>
      </select>
      <button @click="loadReports" class="btn btn-secondary">
        <i class="fas fa-sync"></i> Refresh
      </button>
    </div>

    <!-- Reports List -->
    <div v-if="loading" class="loading">Loading reports...</div>
    <div v-else-if="reports.length === 0" class="empty-state">
      <i class="fas fa-file-alt"></i>
      <p>No compliance reports found</p>
    </div>
    <div v-else class="reports-grid">
      <div v-for="report in reports" :key="report._id" class="report-card">
        <div class="report-header">
          <div>
            <h3>{{ report.title }}</h3>
            <span class="report-number">{{ report.reportNumber }}</span>
          </div>
          <span :class="['status-badge', report.status]">
            {{ formatStatus(report.status) }}
          </span>
        </div>

        <div class="report-body">
          <div class="report-info">
            <div class="info-item">
              <i class="fas fa-calendar"></i>
              {{ formatDate(report.startDate) }} - {{ formatDate(report.endDate) }}
            </div>
            <div class="info-item">
              <i class="fas fa-user"></i>
              {{ report.generatedBy?.name || 'Unknown' }}
            </div>
            <div class="info-item">
              <i class="fas fa-tag"></i>
              {{ formatReportType(report.reportType) }}
            </div>
          </div>

          <div v-if="report.findings" class="findings-summary">
            <div class="finding-stat critical">
              <span class="count">{{ report.findings.criticalIssues || 0 }}</span>
              <span class="label">Critical</span>
            </div>
            <div class="finding-stat warning">
              <span class="count">{{ report.findings.warnings || 0 }}</span>
              <span class="label">Warnings</span>
            </div>
            <div class="finding-stat passed">
              <span class="count">{{ report.findings.passed || 0 }}</span>
              <span class="label">Passed</span>
            </div>
          </div>

          <span :class="['compliance-status', report.complianceStatus]">
            {{ formatComplianceStatus(report.complianceStatus) }}
          </span>
        </div>

        <div class="report-actions">
          <button @click="viewReport(report)" class="btn btn-sm btn-secondary">
            <i class="fas fa-eye"></i> View
          </button>
          <button v-if="report.status === 'draft'" @click="editReport(report)" class="btn btn-sm btn-info">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button v-if="report.status === 'pending_review'" @click="reviewReport(report._id)" class="btn btn-sm btn-success">
            <i class="fas fa-check"></i> Review
          </button>
          <button v-if="report.status === 'reviewed'" @click="approveReport(report._id)" class="btn btn-sm btn-success">
            <i class="fas fa-thumbs-up"></i> Approve
          </button>
        </div>
      </div>
    </div>

    <!-- Simple Create Modal (placeholder) -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Create Compliance Report</h2>
          <button @click="showCreateModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Compliance report creation interface would go here...</p>
        </div>
        <div class="modal-footer">
          <button @click="showCreateModal = false" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import financeService from '@/services/financeService';

export default {
  name: 'ComplianceReportsPage',
  setup() {
    const loading = ref(false);
    const reports = ref([]);
    const dashboard = ref(null);
    const showCreateModal = ref(false);

    const filters = reactive({
      search: '',
      reportType: '',
      status: ''
    });

    const loadReports = async () => {
      try {
        loading.value = true;
        const response = await financeService.getComplianceReports(filters);
        reports.value = response.data.data;
      } catch (error) {
        console.error('Error loading reports:', error);
        alert('Error loading compliance reports');
      } finally {
        loading.value = false;
      }
    };

    const loadDashboard = async () => {
      try {
        const response = await financeService.getComplianceDashboard();
        dashboard.value = response.data.data;
      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
    };

    const getCompliantCount = () => {
      return dashboard.value?.complianceStatuses?.find(s => s._id === 'compliant')?.count || 0;
    };

    const getPendingCount = () => {
      return dashboard.value?.reportTypes?.filter(r => r._id === 'pending_review').reduce((sum, r) => sum + r.count, 0) || 0;
    };

    const viewReport = (report) => {
      console.log('View report:', report);
    };

    const editReport = (report) => {
      console.log('Edit report:', report);
    };

    const reviewReport = async (id) => {
      if (!confirm('Mark this report as reviewed?')) return;
      try {
        await financeService.reviewComplianceReport(id, { notes: 'Reviewed' });
        alert('Report reviewed successfully');
        loadReports();
        loadDashboard();
      } catch (error) {
        console.error('Error reviewing report:', error);
        alert('Error reviewing report');
      }
    };

    const approveReport = async (id) => {
      if (!confirm('Approve this compliance report?')) return;
      try {
        await financeService.approveComplianceReport(id, { notes: 'Approved' });
        alert('Report approved successfully');
        loadReports();
        loadDashboard();
      } catch (error) {
        console.error('Error approving report:', error);
        alert('Error approving report');
      }
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatStatus = (status) => {
      return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatReportType = (type) => {
      return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatComplianceStatus = (status) => {
      return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    onMounted(() => {
      loadReports();
      loadDashboard();
    });

    return {
      loading,
      reports,
      dashboard,
      showCreateModal,
      filters,
      loadReports,
      getCompliantCount,
      getPendingCount,
      viewReport,
      editReport,
      reviewReport,
      approveReport,
      formatDate,
      formatStatus,
      formatReportType,
      formatComplianceStatus
    };
  }
};
</script>

<style scoped>
.compliance-reports-page {
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

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1a202c;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.total { background: #3b82f6; }
.stat-icon.critical { background: #ef4444; }
.stat-icon.compliant { background: #10b981; }
.stat-icon.pending { background: #f59e0b; }

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 2;
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.filter-select {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.report-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.report-number {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.draft { background: #f3f4f6; color: #4b5563; }
.status-badge.pending_review { background: #fef3c7; color: #92400e; }
.status-badge.reviewed { background: #dbeafe; color: #1e40af; }
.status-badge.approved { background: #d1fae5; color: #065f46; }

.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.findings-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.finding-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  flex: 1;
}

.finding-stat.critical { background: #fee2e2; }
.finding-stat.warning { background: #fef3c7; }
.finding-stat.passed { background: #d1fae5; }

.finding-stat .count {
  font-size: 1.5rem;
  font-weight: 700;
}

.finding-stat.critical .count { color: #991b1b; }
.finding-stat.warning .count { color: #92400e; }
.finding-stat.passed .count { color: #065f46; }

.finding-stat .label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.compliance-status {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.compliance-status.compliant { background: #d1fae5; color: #065f46; }
.compliance-status.non_compliant { background: #fee2e2; color: #991b1b; }
.compliance-status.partially_compliant { background: #fef3c7; color: #92400e; }
.compliance-status.under_review { background: #dbeafe; color: #1e40af; }

.report-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1rem;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: #6b7280; color: white; }
.btn-secondary:hover { background: #4b5563; }
.btn-info { background: #0ea5e9; color: white; }
.btn-info:hover { background: #0284c7; }
.btn-success { background: #10b981; color: white; }
.btn-success:hover { background: #059669; }

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.813rem;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
  opacity: 0.5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
