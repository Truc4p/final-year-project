<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reconciliation</h1>
        <p class="text-gray-600">Smart transaction matching and reconciliation</p>
      </div>
      <div class="flex gap-3">
        <button @click="activeTab = 'rules'" 
          :class="['px-4 py-2 rounded-lg', activeTab === 'rules' ? 'bg-blue-600 text-white' : 'bg-gray-200']">
          Matching Rules
        </button>
        <button @click="showCreateBatchModal = true" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + New Batch
        </button>
      </div>
    </div>

    <!-- Dashboard Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-sm text-gray-500">Active Batches</p>
        <p class="text-2xl font-bold text-blue-600">{{ dashboard.activeBatches || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-sm text-gray-500">Total Matched</p>
        <p class="text-2xl font-bold text-green-600">{{ dashboard.totalMatched || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-sm text-gray-500">Open Discrepancies</p>
        <p class="text-2xl font-bold text-orange-600">{{ dashboard.openDiscrepancies || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-sm text-gray-500">Avg Match Rate</p>
        <p class="text-2xl font-bold text-purple-600">{{ dashboard.avgMatchRate || 0 }}%</p>
      </div>
    </div>

    <!-- Rules Tab -->
    <div v-if="activeTab === 'rules'" class="bg-white rounded-lg shadow">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">Matching Rules</h2>
        <button @click="showRuleModal = true" class="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">
          + Add Rule
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source → Target</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="rule in rules" :key="rule._id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="font-medium">{{ rule.name }}</div>
                <div class="text-xs text-gray-500">{{ rule.description }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {{ rule.ruleType?.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">
                {{ rule.sourceType }} → {{ rule.targetType }}
              </td>
              <td class="px-4 py-3 text-sm">{{ rule.priority }}</td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 text-xs rounded-full', rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                  {{ rule.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button @click="toggleRule(rule)" class="text-blue-600 hover:text-blue-800 mr-2 text-sm">
                  {{ rule.isActive ? 'Disable' : 'Enable' }}
                </button>
                <button @click="editRule(rule)" class="text-gray-600 hover:text-gray-800 mr-2 text-sm">Edit</button>
                <button @click="deleteRule(rule._id)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Batches Tab -->
    <div v-else class="space-y-4">
      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow flex gap-4 flex-wrap">
        <select v-model="filters.status" @change="loadBatches" class="border rounded-lg px-3 py-2">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="in_progress">In Progress</option>
          <option value="pending_review">Pending Review</option>
          <option value="completed">Completed</option>
        </select>
        <select v-model="filters.reconciliationType" @change="loadBatches" class="border rounded-lg px-3 py-2">
          <option value="">All Types</option>
          <option value="bank">Bank</option>
          <option value="accounts_receivable">Accounts Receivable</option>
          <option value="accounts_payable">Accounts Payable</option>
        </select>
        <input v-model="filters.search" @input="debouncedSearch" type="text" placeholder="Search batches..." 
          class="border rounded-lg px-3 py-2 flex-1" />
      </div>

      <!-- Batches List -->
      <div class="bg-white rounded-lg shadow">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matched</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Rate</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="batch in batches" :key="batch._id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="font-medium">{{ batch.batchNumber }}</div>
                  <div class="text-xs text-gray-500">{{ batch.name }}</div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    {{ batch.reconciliationType?.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ formatDate(batch.period?.startDate) }} - {{ formatDate(batch.period?.endDate) }}
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ batch.statistics?.matchedItems || 0 }} / {{ batch.statistics?.totalSourceItems || 0 }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-green-600 h-2 rounded-full" :style="{ width: `${batch.statistics?.matchRate || 0}%` }"></div>
                    </div>
                    <span class="text-sm">{{ batch.statistics?.matchRate || 0 }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-1 text-xs rounded-full', getStatusClass(batch.status)]">
                    {{ batch.status?.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <button @click="openBatch(batch)" class="text-blue-600 hover:text-blue-800 mr-2 text-sm">
                    {{ batch.status === 'draft' ? 'Start' : 'View' }}
                  </button>
                  <button v-if="batch.status === 'draft'" @click="deleteBatch(batch._id)" 
                    class="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Batch Modal -->
    <div v-if="showCreateBatchModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 class="text-lg font-semibold mb-4">Create Reconciliation Batch</h3>
        <form @submit.prevent="createBatch" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name *</label>
            <input v-model="batchForm.name" type="text" required class="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Type *</label>
            <select v-model="batchForm.reconciliationType" required class="w-full border rounded-lg px-3 py-2">
              <option value="bank">Bank Reconciliation</option>
              <option value="accounts_receivable">Accounts Receivable</option>
              <option value="accounts_payable">Accounts Payable</option>
              <option value="intercompany">Intercompany</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Start Date *</label>
              <input v-model="batchForm.period.startDate" type="date" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">End Date *</label>
              <input v-model="batchForm.period.endDate" type="date" required class="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="batchForm.description" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="showCreateBatchModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Rule Modal -->
    <div v-if="showRuleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ editingRule ? 'Edit Rule' : 'Create Matching Rule' }}</h3>
        <form @submit.prevent="saveRule" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Name *</label>
              <input v-model="ruleForm.name" type="text" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Rule Type *</label>
              <select v-model="ruleForm.ruleType" required class="w-full border rounded-lg px-3 py-2">
                <option value="exact_match">Exact Match</option>
                <option value="fuzzy_match">Fuzzy Match</option>
                <option value="amount_tolerance">Amount Tolerance</option>
                <option value="date_range">Date Range</option>
                <option value="reference_pattern">Reference Pattern</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Source Type *</label>
              <select v-model="ruleForm.sourceType" required class="w-full border rounded-lg px-3 py-2">
                <option value="invoice">Invoice</option>
                <option value="bill">Bill</option>
                <option value="payment">Payment</option>
                <option value="journal_entry">Journal Entry</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Target Type *</label>
              <select v-model="ruleForm.targetType" required class="w-full border rounded-lg px-3 py-2">
                <option value="invoice">Invoice</option>
                <option value="bill">Bill</option>
                <option value="payment">Payment</option>
                <option value="journal_entry">Journal Entry</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Priority</label>
              <input v-model.number="ruleForm.priority" type="number" min="0" class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Min Match Score</label>
              <input v-model.number="ruleForm.matchingCriteria.minimumScore" type="number" min="0" max="100" 
                class="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Amount Tolerance Type</label>
              <select v-model="ruleForm.amountTolerance.type" class="w-full border rounded-lg px-3 py-2">
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Tolerance Value</label>
              <input v-model.number="ruleForm.amountTolerance.value" type="number" min="0" step="0.01" 
                class="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Date Tolerance (Days)</label>
            <input v-model.number="ruleForm.dateTolerance.days" type="number" min="0" class="w-full border rounded-lg px-3 py-2" />
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center">
              <input v-model="ruleForm.isActive" type="checkbox" class="mr-2" />
              <span class="text-sm">Active</span>
            </label>
            <label class="flex items-center">
              <input v-model="ruleForm.autoReconcile" type="checkbox" class="mr-2" />
              <span class="text-sm">Auto-reconcile matches</span>
            </label>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" @click="closeRuleModal" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash';
import financeService from '@/services/financeService';

const router = useRouter();

const activeTab = ref('batches');
const showCreateBatchModal = ref(false);
const showRuleModal = ref(false);
const editingRule = ref(null);

const batches = ref([]);
const rules = ref([]);
const dashboard = ref({});

const filters = reactive({
  status: '',
  reconciliationType: '',
  search: ''
});

const batchForm = reactive({
  name: '',
  reconciliationType: 'bank',
  description: '',
  period: { startDate: '', endDate: '' }
});

const ruleForm = reactive({
  name: '',
  ruleType: 'exact_match',
  sourceType: 'invoice',
  targetType: 'payment',
  priority: 0,
  matchingCriteria: { minimumScore: 80, matchMode: 'all', fields: [] },
  amountTolerance: { type: 'fixed', value: 0 },
  dateTolerance: { days: 0 },
  isActive: true,
  autoReconcile: false
});

onMounted(() => {
  loadDashboard();
  loadBatches();
  loadRules();
});

const loadDashboard = async () => {
  try {
    const res = await financeService.getReconciliationDashboard();
    const data = res.data.data;
    dashboard.value = {
      activeBatches: data.statusSummary?.filter(s => s._id !== 'completed').reduce((sum, s) => sum + s.count, 0) || 0,
      totalMatched: data.statusSummary?.reduce((sum, s) => sum + s.totalMatched, 0) || 0,
      openDiscrepancies: data.openDiscrepancies?.reduce((sum, d) => sum + d.count, 0) || 0,
      avgMatchRate: Math.round(data.typeSummary?.reduce((sum, t) => sum + (t.avgMatchRate || 0), 0) / Math.max(data.typeSummary?.length || 1, 1)) || 0
    };
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
};

const loadBatches = async () => {
  try {
    const res = await financeService.getReconciliationBatches(filters);
    batches.value = res.data.data;
  } catch (error) {
    console.error('Failed to load batches:', error);
  }
};

const loadRules = async () => {
  try {
    const res = await financeService.getReconciliationRules();
    rules.value = res.data.data;
  } catch (error) {
    console.error('Failed to load rules:', error);
  }
};

const debouncedSearch = debounce(() => loadBatches(), 300);

const createBatch = async () => {
  try {
    await financeService.createReconciliationBatch(batchForm);
    showCreateBatchModal.value = false;
    resetBatchForm();
    loadBatches();
    loadDashboard();
  } catch (error) {
    console.error('Failed to create batch:', error);
  }
};

const deleteBatch = async (id) => {
  if (!confirm('Delete this batch?')) return;
  try {
    await financeService.deleteReconciliationBatch(id);
    loadBatches();
  } catch (error) {
    console.error('Failed to delete batch:', error);
  }
};

const openBatch = (batch) => {
  router.push(`/admin/finance/reconciliation/${batch._id}`);
};

const saveRule = async () => {
  try {
    if (editingRule.value) {
      await financeService.updateReconciliationRule(editingRule.value._id, ruleForm);
    } else {
      await financeService.createReconciliationRule(ruleForm);
    }
    closeRuleModal();
    loadRules();
  } catch (error) {
    console.error('Failed to save rule:', error);
  }
};

const editRule = (rule) => {
  editingRule.value = rule;
  Object.assign(ruleForm, {
    name: rule.name,
    ruleType: rule.ruleType,
    sourceType: rule.sourceType,
    targetType: rule.targetType,
    priority: rule.priority,
    matchingCriteria: rule.matchingCriteria || { minimumScore: 80, matchMode: 'all', fields: [] },
    amountTolerance: rule.amountTolerance || { type: 'fixed', value: 0 },
    dateTolerance: rule.dateTolerance || { days: 0 },
    isActive: rule.isActive,
    autoReconcile: rule.autoReconcile
  });
  showRuleModal.value = true;
};

const toggleRule = async (rule) => {
  try {
    await financeService.toggleReconciliationRule(rule._id);
    loadRules();
  } catch (error) {
    console.error('Failed to toggle rule:', error);
  }
};

const deleteRule = async (id) => {
  if (!confirm('Delete this rule?')) return;
  try {
    await financeService.deleteReconciliationRule(id);
    loadRules();
  } catch (error) {
    console.error('Failed to delete rule:', error);
  }
};

const closeRuleModal = () => {
  showRuleModal.value = false;
  editingRule.value = null;
  resetRuleForm();
};

const resetBatchForm = () => {
  Object.assign(batchForm, {
    name: '', reconciliationType: 'bank', description: '', period: { startDate: '', endDate: '' }
  });
};

const resetRuleForm = () => {
  Object.assign(ruleForm, {
    name: '', ruleType: 'exact_match', sourceType: 'invoice', targetType: 'payment',
    priority: 0, matchingCriteria: { minimumScore: 80, matchMode: 'all', fields: [] },
    amountTolerance: { type: 'fixed', value: 0 }, dateTolerance: { days: 0 },
    isActive: true, autoReconcile: false
  });
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '';

const getStatusClass = (status) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>
