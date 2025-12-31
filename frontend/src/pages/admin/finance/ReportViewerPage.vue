<template>
  <div class="report-viewer-page">
    <div class="page-header">
      <div>
        <button @click="$router.back()" class="back-btn">
          <i class="fas fa-arrow-left"></i> Back to Reports
        </button>
        <h1>{{ report?.name }}</h1>
        <p v-if="report?.description" class="report-description">{{ report.description }}</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" class="btn-secondary" :disabled="loading">
          <i class="fas fa-sync" :class="{ 'fa-spin': loading }"></i> Refresh
        </button>
        <button @click="exportData('pdf')" class="btn-secondary">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button @click="exportData('excel')" class="btn-secondary">
          <i class="fas fa-file-excel"></i> Excel
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && !data" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Running report...
    </div>

    <!-- Report Content -->
    <div v-else-if="data" class="report-content">
      <!-- Summary Stats -->
      <div v-if="summaryStats" class="summary-stats">
        <div v-for="stat in summaryStats" :key="stat.label" class="stat-card">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
      </div>

      <!-- Chart Visualization -->
      <div v-if="report.chartConfig && report.chartConfig.type !== 'table'" class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <!-- Data Table -->
      <div class="table-container">
        <div class="table-header">
          <h3><i class="fas fa-table"></i> Data ({{ data.length }} records)</h3>
          <div class="table-actions">
            <input
              v-model="tableSearch"
              type="text"
              placeholder="Search table..."
              class="search-input"
            />
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th v-for="column in displayColumns" :key="column.field">
                  {{ column.label || column.field }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in filteredData" :key="index">
                <td v-for="column in displayColumns" :key="column.field">
                  {{ formatValue(row[column.field], column.format) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="data.length === 0" class="empty-table">
          No data available for this report
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Chart from 'chart.js/auto';

const route = useRoute();
const router = useRouter();
const API_URL = 'http://localhost:3000/api/finance/reports';

const report = ref(null);
const data = ref(null);
const loading = ref(false);
const tableSearch = ref('');
const chartCanvas = ref(null);
let chartInstance = null;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const loadReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/${route.params.id}`, getAuthHeaders());
    report.value = response.data;
  } catch (error) {
    console.error('Error loading report:', error);
    alert('Failed to load report');
    router.back();
  }
};

const runReport = async () => {
  try {
    loading.value = true;
    const response = await axios.post(
      `${API_URL}/${route.params.id}/run`,
      {},
      getAuthHeaders()
    );
    data.value = response.data.data;
    
    // Update report info
    if (response.data.report) {
      report.value = response.data.report;
    }

    // Render chart after data is loaded
    await nextTick();
    renderChart();
  } catch (error) {
    console.error('Error running report:', error);
    alert(error.response?.data?.message || 'Failed to run report');
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  runReport();
};

const exportData = async (format) => {
  try {
    const response = await axios.get(
      `${API_URL}/${route.params.id}/export/${format}`,
      {
        ...getAuthHeaders(),
        responseType: 'blob'
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.value.name}.${format === 'excel' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error(`Error exporting ${format}:`, error);
    alert(`Failed to export ${format}`);
  }
};

const displayColumns = computed(() => {
  if (!report.value?.columns || report.value.columns.length === 0) {
    // Auto-generate columns from first data row
    if (data.value && data.value.length > 0) {
      return Object.keys(data.value[0]).map(key => ({
        field: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        format: 'text'
      }));
    }
    return [];
  }
  return report.value.columns;
});

const filteredData = computed(() => {
  if (!data.value) return [];
  if (!tableSearch.value) return data.value;

  const search = tableSearch.value.toLowerCase();
  return data.value.filter(row => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(search)
    );
  });
});

const summaryStats = computed(() => {
  if (!data.value || data.value.length === 0) return null;

  const stats = [];
  
  // Count
  stats.push({
    label: 'Total Records',
    value: data.value.length
  });

  // Find numeric columns for sum/avg
  displayColumns.value.forEach(column => {
    if (column.format === 'number' || column.format === 'currency') {
      const values = data.value
        .map(row => parseFloat(row[column.field]))
        .filter(v => !isNaN(v));
      
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        
        stats.push({
          label: `Total ${column.label}`,
          value: formatValue(sum, column.format)
        });
        stats.push({
          label: `Avg ${column.label}`,
          value: formatValue(avg, column.format)
        });
      }
    }
  });

  return stats.slice(0, 6); // Limit to 6 stats
});

const formatValue = (value, format) => {
  if (value === null || value === undefined) return '-';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    
    case 'percentage':
      return `${parseFloat(value).toFixed(2)}%`;
    
    case 'date':
      return new Date(value).toLocaleDateString();
    
    case 'datetime':
      return new Date(value).toLocaleString();
    
    default:
      return value;
  }
};

const renderChart = () => {
  if (!report.value?.chartConfig || !chartCanvas.value || !data.value) return;
  
  const config = report.value.chartConfig;
  if (config.type === 'table') return;

  // Destroy previous chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext('2d');
  
  // Prepare chart data
  const labels = data.value.map(row => row[config.xAxis] || '');
  const datasets = (config.yAxis || []).map((yField, index) => ({
    label: yField,
    data: data.value.map(row => row[yField] || 0),
    backgroundColor: config.colors?.[index] || `hsl(${index * 60}, 70%, 60%)`,
    borderColor: config.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`,
    borderWidth: 2
  }));

  chartInstance = new Chart(ctx, {
    type: config.type,
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: config.showLegend !== false,
          position: 'top'
        },
        title: {
          display: !!config.title,
          text: config.title
        }
      }
    }
  });
};

onMounted(async () => {
  await loadReport();
  await runReport();
});

// Watch for data changes to update chart
watch(() => data.value, () => {
  nextTick(() => renderChart());
});
</script>

<style scoped>
.report-viewer-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin: 0.5rem 0 0 0;
  color: #1a1a1a;
}

.report-description {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 1rem;
}

.back-btn {
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  color: #1976d2;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.2rem;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2196f3;
}

.chart-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container canvas {
  max-height: 400px;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.table-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 250px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  white-space: nowrap;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #666;
}

tbody tr:hover {
  background: #f8f9fa;
}

.empty-table {
  padding: 3rem;
  text-align: center;
  color: #999;
}

.btn-primary,
.btn-secondary {
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
