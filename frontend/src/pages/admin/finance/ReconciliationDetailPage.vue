<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <router-link to="/admin/finance/reconciliation" class="text-blue-600 hover:text-blue-800">← Back</router-link>
          <span class="text-gray-400">|</span>
          <span class="font-mono text-sm">{{ batch.batchNumber }}</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">{{ batch.name }}</h1>
        <p class="text-gray-600">{{ batch.reconciliationType?.replace('_', ' ') }} • {{ formatDate(batch.period?.startDate) }} - {{ formatDate(batch.period?.endDate) }}</p>
      </div>
      <div class="flex gap-3">
        <span :class="['px-3 py-1 rounded-full text-sm', getStatusClass(batch.status)]">
          {{ batch.status?.replace('_', ' ') }}
        </span>
        <button v-if="batch.status === 'draft'" @click="loadItems" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Load Items
        </button>
        <button v-if="batch.status === 'in_progress'" @click="runAutoMatch" :disabled="processing" 
          class="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
          {{ processing ? 'Processing...' : 'Auto Match' }}
        </button>
        <button v-if="batch.status === 'in_progress' && pendingMatches === 0" @click="submitForReview" 
          class="bg-yellow-600 text-white px-4 py-2 rounded-lg">
          Submit for Review
        </button>
        <button v-if="batch.status === 'pending_review'" @click="completeReconciliation" 
          class="bg-purple-600 text-white px-4 py-2 rounded-lg">
          Complete
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Source Items</p>
        <p class="text-xl font-bold">{{ batch.statistics?.totalSourceItems || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Target Items</p>
        <p class="text-xl font-bold">{{ batch.statistics?.totalTargetItems || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Matched</p>
        <p class="text-xl font-bold text-green-600">{{ batch.statistics?.matchedItems || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Unmatched Source</p>
        <p class="text-xl font-bold text-orange-600">{{ batch.unmatchedSource?.length || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Unmatched Target</p>
        <p class="text-xl font-bold text-orange-600">{{ batch.unmatchedTarget?.length || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Match Rate</p>
        <p class="text-xl font-bold text-blue-600">{{ batch.statistics?.matchRate || 0 }}%</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow">
      <div class="border-b flex">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          :class="['px-6 py-3 text-sm font-medium', activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500']">
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Matched Items Tab -->
      <div v-if="activeTab === 'matched'" class="p-4">
        <div class="flex justify-between mb-4">
          <p class="text-sm text-gray-600">{{ pendingMatches }} pending confirmation</p>
          <button v-if="pendingMatches > 0" @click="bulkConfirm" class="text-blue-600 text-sm">
            Confirm All Pending
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Source</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Target</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Score</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Method</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="match in batch.matchedItems" :key="match._id" class="hover:bg-gray-50">
                <td class="px-3 py-2">
                  <div class="text-sm font-medium">{{ match.sourceReference }}</div>
                  <div class="text-xs text-gray-500">{{ formatCurrency(match.sourceAmount) }} • {{ formatDate(match.sourceDate) }}</div>
                </td>
                <td class="px-3 py-2">
                  <div class="text-sm font-medium">{{ match.targetReference }}</div>
                  <div class="text-xs text-gray-500">{{ formatCurrency(match.targetAmount) }} • {{ formatDate(match.targetDate) }}</div>
                </td>
                <td class="px-3 py-2">
                  <span :class="['px-2 py-0.5 text-xs rounded', getScoreClass(match.matchScore)]">
                    {{ match.matchScore }}%
                  </span>
                </td>
                <td class="px-3 py-2 text-sm">
                  {{ match.matchedBy?.method || 'auto' }}
                  <span v-if="match.matchedBy?.ruleName" class="text-xs text-gray-500 block">{{ match.matchedBy.ruleName }}</span>
                </td>
                <td class="px-3 py-2">
                  <span :class="['px-2 py-0.5 text-xs rounded-full', getMatchStatusClass(match.status)]">
                    {{ match.status }}
                  </span>
                </td>
                <td class="px-3 py-2">
                  <template v-if="match.status === 'pending'">
                    <button @click="confirmMatch(match._id)" class="text-green-600 hover:text-green-800 text-sm mr-2">Confirm</button>
                    <button @click="rejectMatch(match._id)" class="text-red-600 hover:text-red-800 text-sm">Reject</button>
                  </template>
                  <span v-else class="text-xs text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Unmatched Source Tab -->
      <div v-if="activeTab === 'unmatched_source'" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Reference</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in batch.unmatchedSource" :key="item.itemId" 
                :class="['hover:bg-gray-50', selectedSource?._id === item.itemId ? 'bg-blue-50' : '']">
                <td class="px-3 py-2 font-medium text-sm">{{ item.reference }}</td>
                <td class="px-3 py-2 text-sm">{{ item.itemType }}</td>
                <td class="px-3 py-2 text-sm">{{ formatCurrency(item.amount) }}</td>
                <td class="px-3 py-2 text-sm">{{ formatDate(item.date) }}</td>
                <td class="px-3 py-2">
                  <button @click="selectSource(item)" class="text-blue-600 hover:text-blue-800 text-sm">
                    {{ selectedSource?.itemId === item.itemId ? 'Selected' : 'Select for Match' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Unmatched Target Tab -->
      <div v-if="activeTab === 'unmatched_target'" class="p-4">
        <div v-if="selectedSource" class="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
          <span class="text-sm">Selected source: <strong>{{ selectedSource.reference }}</strong> ({{ formatCurrency(selectedSource.amount) }})</span>
          <button @click="selectedSource = null" class="text-sm text-blue-600">Clear</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Reference</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in batch.unmatchedTarget" :key="item.itemId" class="hover:bg-gray-50">
                <td class="px-3 py-2 font-medium text-sm">{{ item.reference }}</td>
                <td class="px-3 py-2 text-sm">{{ item.itemType }}</td>
                <td class="px-3 py-2 text-sm">{{ formatCurrency(item.amount) }}</td>
                <td class="px-3 py-2 text-sm">{{ formatDate(item.date) }}</td>
                <td class="px-3 py-2">
                  <button v-if="selectedSource" @click="manualMatch(item)" class="text-green-600 hover:text-green-800 text-sm">
                    Match with Selected
                  </button>
                  <span v-else class="text-xs text-gray-400">Select source first</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Discrepancies Tab -->
      <div v-if="activeTab === 'discrepancies'" class="p-4">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Source</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Target</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Difference</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Severity</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="disc in batch.discrepancies" :key="disc._id" class="hover:bg-gray-50">
                <td class="px-3 py-2">
                  <span class="px-2 py-0.5 text-xs rounded bg-gray-100">{{ disc.discrepancyType?.replace('_', ' ') }}</span>
                </td>
                <td class="px-3 py-2 text-sm">
                  {{ disc.sourceReference }} ({{ formatCurrency(disc.sourceAmount) }})
                </td>
                <td class="px-3 py-2 text-sm">
                  {{ disc.targetReference }} ({{ formatCurrency(disc.targetAmount) }})
                </td>
                <td class="px-3 py-2 text-sm font-medium" :class="disc.amountDifference > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(disc.amountDifference) }}
                </td>
                <td class="px-3 py-2">
                  <span :class="['px-2 py-0.5 text-xs rounded-full', getSeverityClass(disc.severity)]">
                    {{ disc.severity }}
                  </span>
                </td>
                <td class="px-3 py-2">
                  <span :class="['px-2 py-0.5 text-xs rounded-full', disc.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
                    {{ disc.status }}
                  </span>
                </td>
                <td class="px-3 py-2">
                  <button v-if="disc.status !== 'resolved'" @click="openResolveModal(disc)" class="text-blue-600 hover:text-blue-800 text-sm">
                    Resolve
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Suggestions Tab -->
      <div v-if="activeTab === 'suggestions'" class="p-4">
        <button @click="loadSuggestions" class="mb-4 text-blue-600 text-sm">Refresh Suggestions</button>
        <div class="space-y-3">
          <div v-for="(sug, idx) in suggestions" :key="idx" class="border rounded-lg p-3 flex justify-between items-center">
            <div class="flex-1">
              <div class="flex gap-4">
                <div>
                  <span class="text-xs text-gray-500">Source:</span>
                  <p class="font-medium">{{ sug.sourceItem.reference }} ({{ formatCurrency(sug.sourceItem.amount) }})</p>
                </div>
                <div>
                  <span class="text-xs text-gray-500">Target:</span>
                  <p class="font-medium">{{ sug.targetItem.reference }} ({{ formatCurrency(sug.targetItem.amount) }})</p>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">Score: {{ sug.score }}% via {{ sug.ruleName }}</p>
            </div>
            <button @click="acceptSuggestion(sug)" class="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
              Accept Match
            </button>
          </div>
          <p v-if="suggestions.length === 0" class="text-gray-500 text-center py-4">No suggestions available</p>
        </div>
      </div>
    </div>

    <!-- Resolve Discrepancy Modal -->
    <div v-if="showResolveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Resolve Discrepancy</h3>
        <div class="mb-4">
          <p class="text-sm text-gray-600">Amount Difference: <strong>{{ formatCurrency(resolveForm.discrepancy?.amountDifference) }}</strong></p>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Resolution *</label>
          <select v-model="resolveForm.resolution" required class="w-full border rounded-lg px-3 py-2">
            <option value="matched">Matched - Amounts reconciled</option>
            <option value="adjusted">Adjusted - Made correction entry</option>
            <option value="written_off">Written Off</option>
            <option value="voided">Voided - Transaction cancelled</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Notes</label>
          <textarea v-model="resolveForm.notes" rows="3" class="w-full border rounded-lg px-3 py-2"></textarea>
        </div>
        <div class="flex justify-end gap-3">
          <button @click="showResolveModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button @click="resolveDiscrepancy" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Resolve</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import financeService from '@/services/financeService';

const route = useRoute();
const router = useRouter();

const batch = ref({});
const suggestions = ref([]);
const processing = ref(false);
const activeTab = ref('matched');
const selectedSource = ref(null);
const showResolveModal = ref(false);

const resolveForm = reactive({
  discrepancy: null,
  resolution: 'matched',
  notes: ''
});

const tabs = computed(() => [
  { id: 'matched', label: 'Matched', count: batch.value.matchedItems?.length || 0 },
  { id: 'unmatched_source', label: 'Unmatched Source', count: batch.value.unmatchedSource?.length || 0 },
  { id: 'unmatched_target', label: 'Unmatched Target', count: batch.value.unmatchedTarget?.length || 0 },
  { id: 'discrepancies', label: 'Discrepancies', count: batch.value.discrepancies?.filter(d => d.status !== 'resolved').length || 0 },
  { id: 'suggestions', label: 'Suggestions' }
]);

const pendingMatches = computed(() => 
  batch.value.matchedItems?.filter(m => m.status === 'pending').length || 0
);

onMounted(() => {
  loadBatch();
});

const loadBatch = async () => {
  try {
    const res = await financeService.getReconciliationBatch(route.params.id);
    batch.value = res.data.data;
  } catch (error) {
    console.error('Failed to load batch:', error);
  }
};

const loadItems = async () => {
  try {
    processing.value = true;
    await financeService.loadReconciliationItems(route.params.id);
    await loadBatch();
  } catch (error) {
    console.error('Failed to load items:', error);
  } finally {
    processing.value = false;
  }
};

const runAutoMatch = async () => {
  try {
    processing.value = true;
    const res = await financeService.runAutoMatching(route.params.id);
    alert(`Auto-matching completed: ${res.data.data.totalMatches} matches found`);
    await loadBatch();
  } catch (error) {
    console.error('Failed to run auto-match:', error);
  } finally {
    processing.value = false;
  }
};

const confirmMatch = async (matchId) => {
  try {
    await financeService.confirmReconciliationMatch(route.params.id, matchId);
    await loadBatch();
  } catch (error) {
    console.error('Failed to confirm match:', error);
  }
};

const rejectMatch = async (matchId) => {
  if (!confirm('Reject this match?')) return;
  try {
    await financeService.rejectReconciliationMatch(route.params.id, matchId);
    await loadBatch();
  } catch (error) {
    console.error('Failed to reject match:', error);
  }
};

const bulkConfirm = async () => {
  const pendingIds = batch.value.matchedItems?.filter(m => m.status === 'pending').map(m => m._id) || [];
  if (pendingIds.length === 0) return;
  try {
    await financeService.bulkConfirmReconciliationMatches(route.params.id, pendingIds);
    await loadBatch();
  } catch (error) {
    console.error('Failed to bulk confirm:', error);
  }
};

const selectSource = (item) => {
  selectedSource.value = selectedSource.value?.itemId === item.itemId ? null : item;
};

const manualMatch = async (targetItem) => {
  if (!selectedSource.value) return;
  try {
    await financeService.manualReconciliationMatch(route.params.id, {
      sourceItemId: selectedSource.value.itemId,
      targetItemId: targetItem.itemId
    });
    selectedSource.value = null;
    await loadBatch();
  } catch (error) {
    console.error('Failed to manual match:', error);
  }
};

const loadSuggestions = async () => {
  try {
    const res = await financeService.getReconciliationSuggestions(route.params.id);
    suggestions.value = res.data.data;
  } catch (error) {
    console.error('Failed to load suggestions:', error);
  }
};

const acceptSuggestion = async (sug) => {
  try {
    await financeService.manualReconciliationMatch(route.params.id, {
      sourceItemId: sug.sourceItem.itemId,
      targetItemId: sug.targetItem.itemId
    });
    await loadBatch();
    await loadSuggestions();
  } catch (error) {
    console.error('Failed to accept suggestion:', error);
  }
};

const openResolveModal = (disc) => {
  resolveForm.discrepancy = disc;
  resolveForm.resolution = 'matched';
  resolveForm.notes = '';
  showResolveModal.value = true;
};

const resolveDiscrepancy = async () => {
  try {
    await financeService.resolveReconciliationDiscrepancy(route.params.id, resolveForm.discrepancy._id, {
      resolution: resolveForm.resolution,
      notes: resolveForm.notes
    });
    showResolveModal.value = false;
    await loadBatch();
  } catch (error) {
    console.error('Failed to resolve discrepancy:', error);
  }
};

const submitForReview = async () => {
  try {
    await financeService.submitReconciliationForReview(route.params.id);
    await loadBatch();
  } catch (error) {
    console.error('Failed to submit for review:', error);
  }
};

const completeReconciliation = async () => {
  try {
    await financeService.completeReconciliation(route.params.id);
    await loadBatch();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to complete');
  }
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '';
const formatCurrency = (val) => val ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00';

const getStatusClass = (status) => ({
  draft: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800'
}[status] || 'bg-gray-100 text-gray-800');

const getMatchStatusClass = (status) => ({
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}[status] || 'bg-gray-100 text-gray-800');

const getScoreClass = (score) => {
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getSeverityClass = (severity) => ({
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}[severity] || 'bg-gray-100 text-gray-800');
</script>
