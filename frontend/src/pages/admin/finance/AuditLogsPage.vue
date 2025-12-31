<template>
  <div class="audit-logs-page">
    <div class="page-header">
      <h1 class="page-title">Audit Logs</h1>
      <div class="header-actions">
        <button @click="exportLogs" class="btn btn-secondary">
          <i class="fas fa-download"></i> Export
        </button>
        <button @click="loadStatistics" class="btn btn-info">
          <i class="fas fa-chart-bar"></i> Statistics
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="fas fa-list"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalLogs) }}</div>
          <div class="stat-label">Total Logs</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon actions">
          <i class="fas fa-bolt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.actions?.length || 0 }}</div>
          <div class="stat-label">Action Types</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon entities">
          <i class="fas fa-database"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.entities?.length || 0 }}</div>
          <div class="stat-label">Entity Types</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon users">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.users?.length || 0 }}</div>
          <div class="stat-label">Active Users</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search logs..."
          class="search-input"
          @keyup.enter="loadLogs"
        />
        
        <select v-model="filters.entityType" class="filter-select">
          <option value="">All Entity Types</option>
          <option value="Invoice">Invoice</option>
          <option value="Bill">Bill</option>
          <option value="BankAccount">Bank Account</option>
          <option value="Customer">Customer</option>
          <option value="Budget">Budget</option>
          <option value="ApprovalWorkflow">Approval Workflow</option>
          <option value="TaxRate">Tax Rate</option>
          <option value="TaxLiability">Tax Liability</option>
          <option value="PaymentBatch">Payment Batch</option>
          <option value="ScheduledPayment">Scheduled Payment</option>
        </select>

        <select v-model="filters.action" class="filter-select">
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="process">Process</option>
          <option value="cancel">Cancel</option>
          <option value="pay">Pay</option>
          <option value="export">Export</option>
        </select>

        <select v-model="filters.status" class="filter-select">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="pending">Pending</option>
        </select>

        <select v-model="filters.complianceFlag" class="filter-select">
          <option value="">All Flags</option>
          <option value="sensitive_data">Sensitive Data</option>
          <option value="financial_transaction">Financial Transaction</option>
          <option value="user_action">User Action</option>
          <option value="system_change">System Change</option>
          <option value="security_event">Security Event</option>
        </select>
      </div>

      <div class="filters-row">
        <input 
          v-model="filters.startDate" 
          type="date" 
          class="date-input"
        />
        <span class="date-separator">to</span>
        <input 
          v-model="filters.endDate" 
          type="date" 
          class="date-input"
        />

        <button @click="applyFilters" class="btn btn-primary">
          <i class="fas fa-search"></i> Apply Filters
        </button>
        <button @click="resetFilters" class="btn btn-secondary">
          <i class="fas fa-redo"></i> Reset
        </button>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="table-container">
      <div v-if="loading" class="loading">Loading audit logs...</div>
      <div v-else-if="logs.length === 0" class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>No audit logs found</p>
      </div>
      <table v-else class="logs-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log._id" :class="{ 'row-failure': log.status === 'failure' }">
            <td>{{ formatDateTime(log.createdAt) }}</td>
            <td>
              <div class="user-cell">
                <span class="user-name">{{ log.user?.name || 'Unknown' }}</span>
                <span class="user-email">{{ log.user?.email || '' }}</span>
              </div>
            </td>
            <td>
              <span :class="['action-badge', getActionClass(log.action)]">
                {{ formatAction(log.action) }}
              </span>
            </td>
            <td>
              <div class="entity-cell">
                <span class="entity-type">{{ log.entityType }}</span>
                <span class="entity-id">{{ log.entityId }}</span>
              </div>
            </td>
            <td class="description-cell">{{ log.description }}</td>
            <td>
              <span :class="['status-badge', log.status]">
                {{ formatStatus(log.status) }}
              </span>
            </td>
            <td>
              <button @click="viewDetails(log)" class="btn-icon" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="pagination">
      <button 
        @click="changePage(pagination.page - 1)"
        :disabled="pagination.page === 1"
        class="btn btn-sm btn-secondary"
      >
        <i class="fas fa-chevron-left"></i> Previous
      </button>
      
      <span class="page-info">
        Page {{ pagination.page }} of {{ pagination.pages }}
        ({{ pagination.total }} total)
      </span>
      
      <button 
        @click="changePage(pagination.page + 1)"
        :disabled="pagination.page >= pagination.pages"
        class="btn btn-sm btn-secondary"
      >
        Next <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedLog" class="modal-overlay" @click.self="selectedLog = null">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Audit Log Details</h2>
          <button @click="selectedLog = null" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-section">
            <h3>Basic Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Timestamp:</span>
                <span class="value">{{ formatDateTime(selectedLog.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">User:</span>
                <span class="value">{{ selectedLog.user?.name }} ({{ selectedLog.user?.email }})</span>
              </div>
              <div class="detail-item">
                <span class="label">Action:</span>
                <span class="value">{{ formatAction(selectedLog.action) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span :class="['value', 'status-badge', selectedLog.status]">
                  {{ formatStatus(selectedLog.status) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Entity Type:</span>
                <span class="value">{{ selectedLog.entityType }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Entity ID:</span>
                <span class="value">{{ selectedLog.entityId }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Description</h3>
            <p>{{ selectedLog.description }}</p>
          </div>

          <div v-if="selectedLog.ipAddress || selectedLog.userAgent" class="detail-section">
            <h3>Request Information</h3>
            <div class="detail-grid">
              <div v-if="selectedLog.ipAddress" class="detail-item">
                <span class="label">IP Address:</span>
                <span class="value">{{ selectedLog.ipAddress }}</span>
              </div>
              <div v-if="selectedLog.userAgent" class="detail-item full-width">
                <span class="label">User Agent:</span>
                <span class="value">{{ selectedLog.userAgent }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedLog.status === 'failure'" class="detail-section error-section">
            <h3>Error Details</h3>
            <div class="detail-grid">
              <div v-if="selectedLog.errorCode" class="detail-item">
                <span class="label">Error Code:</span>
                <span class="value">{{ selectedLog.errorCode }}</span>
              </div>
              <div v-if="selectedLog.errorMessage" class="detail-item full-width">
                <span class="label">Error Message:</span>
                <span class="value error-message">{{ selectedLog.errorMessage }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedLog.complianceFlags?.length" class="detail-section">
            <h3>Compliance Flags</h3>
            <div class="flags-container">
              <span v-for="flag in selectedLog.complianceFlags" :key="flag" class="flag-badge">
                {{ formatFlag(flag) }}
              </span>
            </div>
          </div>

          <div v-if="selectedLog.changes && Object.keys(selectedLog.changes).length > 0" class="detail-section">
            <h3>Changes Made</h3>
            <pre class="code-block">{{ JSON.stringify(selectedLog.changes, null, 2) }}</pre>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="selectedLog = null" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import financeService from '@/services/financeService';

export default {
  name: 'AuditLogsPage',
  setup() {
    const loading = ref(false);
    const logs = ref([]);
    const stats = ref(null);
    const selectedLog = ref(null);
    
    const pagination = reactive({
      page: 1,
      limit: 50,
      total: 0,
      pages: 0
    });

    const filters = reactive({
      search: '',
      entityType: '',
      action: '',
      status: '',
      complianceFlag: '',
      startDate: '',
      endDate: ''
    });

    const loadLogs = async () => {
      try {
        loading.value = true;
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
          if (params[key] === '') delete params[key];
        });

        const response = await financeService.getAuditLogs(params);
        logs.value = response.data.data;
        
        if (response.data.pagination) {
          Object.assign(pagination, response.data.pagination);
        }
      } catch (error) {
        console.error('Error loading logs:', error);
        alert('Error loading audit logs');
      } finally {
        loading.value = false;
      }
    };

    const loadStatistics = async () => {
      try {
        const params = {};
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const response = await financeService.getAuditStatistics(params);
        stats.value = response.data.data;
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    };

    const applyFilters = () => {
      pagination.page = 1;
      loadLogs();
    };

    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = '';
      });
      pagination.page = 1;
      loadLogs();
    };

    const changePage = (page) => {
      pagination.page = page;
      loadLogs();
    };

    const viewDetails = (log) => {
      selectedLog.value = log;
    };

    const exportLogs = async () => {
      try {
        const params = { ...filters, format: 'csv' };
        Object.keys(params).forEach(key => {
          if (params[key] === '') delete params[key];
        });

        const queryString = new URLSearchParams(params).toString();
        const url = `${financeService.API_BASE_URL}/api/finance/audit/logs/export?${queryString}`;
        
        window.open(url, '_blank');
      } catch (error) {
        console.error('Error exporting logs:', error);
        alert('Error exporting logs');
      }
    };

    const formatNumber = (num) => {
      return num ? num.toLocaleString() : '0';
    };

    const formatDateTime = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatAction = (action) => {
      return action.charAt(0).toUpperCase() + action.slice(1);
    };

    const formatStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatFlag = (flag) => {
      return flag.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const getActionClass = (action) => {
      const classes = {
        create: 'create',
        update: 'update',
        delete: 'delete',
        approve: 'approve',
        reject: 'reject',
        process: 'process',
        cancel: 'cancel'
      };
      return classes[action] || 'default';
    };

    onMounted(() => {
      loadLogs();
      loadStatistics();
    });

    return {
      loading,
      logs,
      stats,
      selectedLog,
      pagination,
      filters,
      loadLogs,
      loadStatistics,
      applyFilters,
      resetFilters,
      changePage,
      viewDetails,
      exportLogs,
      formatNumber,
      formatDateTime,
      formatAction,
      formatStatus,
      formatFlag,
      getActionClass
    };
  }
};
</script>

<style scoped>
.audit-logs-page {
  padding: 2rem;
  max-width: 1600px;
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

.header-actions {
  display: flex;
  gap: 1rem;
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
.stat-icon.actions { background: #10b981; }
.stat-icon.entities { background: #f59e0b; }
.stat-icon.users { background: #8b5cf6; }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filters-row:last-child {
  margin-bottom: 0;
}

.search-input {
  flex: 2;
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
}

.filter-select {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
}

.date-input {
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
}

.date-separator {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table thead {
  background: #f9fafb;
}

.logs-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.logs-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.logs-table tbody tr:hover {
  background: #f9fafb;
}

.row-failure {
  background: #fef2f2 !important;
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 500;
  color: #1a202c;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.entity-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.entity-type {
  font-weight: 500;
  color: #1a202c;
}

.entity-id {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.description-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.action-badge.create { background: #d1fae5; color: #065f46; }
.action-badge.update { background: #dbeafe; color: #1e40af; }
.action-badge.delete { background: #fee2e2; color: #991b1b; }
.action-badge.approve { background: #d1fae5; color: #065f46; }
.action-badge.reject { background: #fee2e2; color: #991b1b; }
.action-badge.process { background: #dbeafe; color: #1e40af; }
.action-badge.cancel { background: #fed7aa; color: #92400e; }
.action-badge.default { background: #f3f4f6; color: #4b5563; }

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.success { background: #d1fae5; color: #065f46; }
.status-badge.failure { background: #fee2e2; color: #991b1b; }
.status-badge.pending { background: #fef3c7; color: #92400e; }

.btn-icon {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #eff6ff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-secondary { background: #6b7280; color: white; }
.btn-secondary:hover:not(:disabled) { background: #4b5563; }
.btn-info { background: #0ea5e9; color: white; }
.btn-info:hover { background: #0284c7; }

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
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1a202c;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.detail-item .value {
  font-size: 0.938rem;
  color: #1a202c;
}

.error-section {
  background: #fef2f2;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.error-message {
  color: #991b1b !important;
  font-weight: 500;
}

.flags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.flag-badge {
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
}

.code-block {
  background: #1f2937;
  color: #10b981;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.813rem;
  font-family: 'Courier New', monospace;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
