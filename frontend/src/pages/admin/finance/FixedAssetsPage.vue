<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Fixed Assets</h1>
        <p class="text-gray-600">Manage assets, depreciation, and disposals</p>
      </div>
      <div class="flex gap-3">
        <button @click="showReports = !showReports" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
          {{ showReports ? 'Hide Reports' : 'Reports' }}
        </button>
        <button @click="openAssetModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + New Asset
        </button>
      </div>
    </div>

    <!-- Dashboard Stats -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Total Assets</p>
        <p class="text-xl font-bold">{{ dashboard.totals?.totalAssets || 0 }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Total Cost</p>
        <p class="text-xl font-bold text-blue-600">{{ formatCurrency(dashboard.totals?.totalCost) }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Book Value</p>
        <p class="text-xl font-bold text-green-600">{{ formatCurrency(dashboard.totals?.totalBookValue) }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Accumulated Dep.</p>
        <p class="text-xl font-bold text-orange-600">{{ formatCurrency(dashboard.totals?.totalAccumulatedDepreciation) }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-xs text-gray-500">Maintenance Due</p>
        <p class="text-xl font-bold text-red-600">{{ dashboard.maintenanceDue || 0 }}</p>
      </div>
    </div>

    <!-- Reports Panel -->
    <div v-if="showReports" class="bg-white rounded-lg shadow mb-6 p-4">
      <h3 class="font-semibold mb-4">Quick Reports</h3>
      <div class="flex gap-4 flex-wrap">
        <button @click="generateReport('register')" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
          📋 Asset Register
        </button>
        <button @click="generateReport('depreciation')" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
          📉 Depreciation Report
        </button>
        <button @click="runBulkDepreciation" :disabled="processing" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
          {{ processing ? 'Processing...' : '⚡ Run Bulk Depreciation' }}
        </button>
      </div>
    </div>

    <!-- Category Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="cat in dashboard.categoryStats" :key="cat._id" 
        class="bg-white p-3 rounded-lg shadow cursor-pointer hover:shadow-md"
        @click="filters.category = cat._id; loadAssets()">
        <p class="text-xs text-gray-500 capitalize">{{ cat._id?.replace('_', ' ') }}</p>
        <p class="font-bold">{{ cat.count }} assets</p>
        <p class="text-sm text-green-600">{{ formatCurrency(cat.totalBookValue) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 flex-wrap">
      <input v-model="filters.search" @input="debouncedSearch" type="text" placeholder="Search assets..." 
        class="border rounded-lg px-3 py-2 flex-1 min-w-48" />
      <select v-model="filters.category" @change="loadAssets" class="border rounded-lg px-3 py-2">
        <option value="">All Categories</option>
        <option value="land">Land</option>
        <option value="buildings">Buildings</option>
        <option value="machinery">Machinery</option>
        <option value="vehicles">Vehicles</option>
        <option value="furniture">Furniture</option>
        <option value="equipment">Equipment</option>
        <option value="computers">Computers</option>
        <option value="software">Software</option>
      </select>
      <select v-model="filters.status" @change="loadAssets" class="border rounded-lg px-3 py-2">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="under_maintenance">Under Maintenance</option>
        <option value="disposed">Disposed</option>
        <option value="sold">Sold</option>
      </select>
      <button @click="clearFilters" class="text-blue-600 hover:text-blue-800">Clear</button>
    </div>

    <!-- Assets Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acquisition</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Value</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depreciation</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="asset in assets" :key="asset._id" class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="font-medium">{{ asset.name }}</div>
                <div class="text-xs text-gray-500 font-mono">{{ asset.assetNumber }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                  {{ asset.category?.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">{{ formatDate(asset.acquisitionDate) }}</td>
              <td class="px-4 py-3 text-sm font-medium">{{ formatCurrency(asset.acquisitionCost) }}</td>
              <td class="px-4 py-3 text-sm font-medium text-green-600">{{ formatCurrency(asset.bookValue) }}</td>
              <td class="px-4 py-3">
                <div class="text-sm">{{ formatCurrency(asset.accumulatedDepreciation) }}</div>
                <div class="text-xs text-gray-500">{{ asset.depreciationMethod?.replace('_', ' ') }}</div>
              </td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 text-xs rounded-full', getStatusClass(asset.status)]">
                  {{ asset.status?.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="viewAsset(asset)" class="text-blue-600 hover:text-blue-800 text-sm">View</button>
                  <button v-if="asset.status === 'active'" @click="openDepreciationModal(asset)" class="text-purple-600 hover:text-purple-800 text-sm">Depreciate</button>
                  <button v-if="asset.status === 'active'" @click="openDisposeModal(asset)" class="text-red-600 hover:text-red-800 text-sm">Dispose</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 border-t flex justify-between items-center">
        <p class="text-sm text-gray-600">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
        </p>
        <div class="flex gap-2">
          <button @click="changePage(-1)" :disabled="pagination.page <= 1" class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
          <button @click="changePage(1)" :disabled="pagination.page >= pagination.pages" class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>

    <!-- Asset Modal -->
    <div v-if="showAssetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ editingAsset ? 'Edit Asset' : 'New Fixed Asset' }}</h3>
        <form @submit.prevent="saveAsset" class="space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">Asset Name *</label>
              <input v-model="assetForm.name" type="text" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Category *</label>
              <select v-model="assetForm.category" required class="w-full border rounded-lg px-3 py-2">
                <option value="land">Land</option>
                <option value="buildings">Buildings</option>
                <option value="machinery">Machinery</option>
                <option value="vehicles">Vehicles</option>
                <option value="furniture">Furniture</option>
                <option value="equipment">Equipment</option>
                <option value="computers">Computers</option>
                <option value="software">Software</option>
                <option value="leasehold_improvements">Leasehold Improvements</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Serial Number</label>
              <input v-model="assetForm.serialNumber" type="text" class="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <!-- Acquisition -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Acquisition Date *</label>
              <input v-model="assetForm.acquisitionDate" type="date" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Acquisition Cost *</label>
              <input v-model.number="assetForm.acquisitionCost" type="number" min="0" step="0.01" required class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Acquisition Method</label>
              <select v-model="assetForm.acquisitionMethod" class="w-full border rounded-lg px-3 py-2">
                <option value="purchase">Purchase</option>
                <option value="lease">Lease</option>
                <option value="donation">Donation</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>

          <!-- Depreciation -->
          <div class="grid grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Depreciation Method</label>
              <select v-model="assetForm.depreciationMethod" class="w-full border rounded-lg px-3 py-2">
                <option value="straight_line">Straight Line</option>
                <option value="declining_balance">Declining Balance</option>
                <option value="double_declining">Double Declining</option>
                <option value="sum_of_years">Sum of Years</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Useful Life (Years)</label>
              <input v-model.number="assetForm.usefulLifeYears" type="number" min="0" class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Salvage Value</label>
              <input v-model.number="assetForm.salvageValue" type="number" min="0" step="0.01" class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div v-if="assetForm.depreciationMethod === 'declining_balance'">
              <label class="block text-sm font-medium mb-1">Rate (%)</label>
              <input v-model.number="assetForm.depreciationRate" type="number" min="0" max="100" class="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <!-- Location -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Building/Location</label>
              <input v-model="assetForm.location.building" type="text" class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Department</label>
              <input v-model="assetForm.department" type="text" class="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Condition</label>
              <select v-model="assetForm.condition" class="w-full border rounded-lg px-3 py-2">
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea v-model="assetForm.description" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" @click="showAssetModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg">{{ editingAsset ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dispose Modal -->
    <div v-if="showDisposeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Dispose Asset</h3>
        <p class="text-sm text-gray-600 mb-4">{{ selectedAsset?.name }} ({{ selectedAsset?.assetNumber }})</p>
        <p class="text-sm mb-4">Current Book Value: <strong>{{ formatCurrency(selectedAsset?.bookValue) }}</strong></p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Disposal Method *</label>
            <select v-model="disposeForm.method" required class="w-full border rounded-lg px-3 py-2">
              <option value="sale">Sale</option>
              <option value="scrap">Scrap</option>
              <option value="donation">Donation</option>
              <option value="write_off">Write Off</option>
              <option value="trade_in">Trade In</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Disposal Date</label>
            <input v-model="disposeForm.date" type="date" class="w-full border rounded-lg px-3 py-2" />
          </div>
          <div v-if="disposeForm.method === 'sale'">
            <label class="block text-sm font-medium mb-1">Sale Proceeds</label>
            <input v-model.number="disposeForm.proceeds" type="number" min="0" step="0.01" class="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Reason</label>
            <textarea v-model="disposeForm.reason" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
          </div>
          
          <!-- Gain/Loss Preview -->
          <div v-if="disposeForm.proceeds" class="p-3 rounded-lg" :class="gainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'">
            <p class="text-sm">Estimated {{ gainLoss >= 0 ? 'Gain' : 'Loss' }}: 
              <strong :class="gainLoss >= 0 ? 'text-green-600' : 'text-red-600'">{{ formatCurrency(Math.abs(gainLoss)) }}</strong>
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDisposeModal = false" class="px-4 py-2 border rounded-lg">Cancel</button>
          <button @click="disposeAsset" class="px-4 py-2 bg-red-600 text-white rounded-lg">Dispose</button>
        </div>
      </div>
    </div>

    <!-- Depreciation Modal -->
    <div v-if="showDepreciationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">Depreciation Schedule</h3>
        <p class="text-sm text-gray-600 mb-2">{{ selectedAsset?.name }} ({{ selectedAsset?.assetNumber }})</p>
        <div class="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>Method: <strong>{{ selectedAsset?.depreciationMethod?.replace('_', ' ') }}</strong></div>
          <div>Cost: <strong>{{ formatCurrency(selectedAsset?.acquisitionCost) }}</strong></div>
          <div>Book Value: <strong class="text-green-600">{{ formatCurrency(selectedAsset?.bookValue) }}</strong></div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left">Period</th>
                <th class="px-3 py-2 text-right">Opening</th>
                <th class="px-3 py-2 text-right">Depreciation</th>
                <th class="px-3 py-2 text-right">Accumulated</th>
                <th class="px-3 py-2 text-right">Closing</th>
                <th class="px-3 py-2 text-center">Status</th>
                <th class="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(period, idx) in depreciationSchedule" :key="idx" :class="period.isProcessed ? 'bg-green-50' : ''">
                <td class="px-3 py-2">{{ period.period }}</td>
                <td class="px-3 py-2 text-right">{{ formatCurrency(period.openingValue) }}</td>
                <td class="px-3 py-2 text-right text-orange-600">{{ formatCurrency(period.depreciationAmount) }}</td>
                <td class="px-3 py-2 text-right">{{ formatCurrency(period.accumulatedDepreciation) }}</td>
                <td class="px-3 py-2 text-right text-green-600">{{ formatCurrency(period.closingValue) }}</td>
                <td class="px-3 py-2 text-center">
                  <span v-if="period.isProcessed" class="text-green-600">✓</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-3 py-2">
                  <button v-if="!period.isProcessed && canProcessPeriod(idx)" @click="processDepreciation(idx)"
                    class="text-purple-600 hover:text-purple-800 text-xs">Process</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mt-4">
          <button @click="showDepreciationModal = false" class="px-4 py-2 border rounded-lg">Close</button>
        </div>
      </div>
    </div>

    <!-- Asset Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold">{{ selectedAsset?.name }}</h3>
            <p class="text-sm text-gray-500 font-mono">{{ selectedAsset?.assetNumber }}</p>
          </div>
          <span :class="['px-3 py-1 rounded-full text-sm', getStatusClass(selectedAsset?.status)]">
            {{ selectedAsset?.status?.replace('_', ' ') }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-3">
            <h4 class="font-medium border-b pb-1">Asset Information</h4>
            <p class="text-sm"><span class="text-gray-500">Category:</span> {{ selectedAsset?.category }}</p>
            <p class="text-sm"><span class="text-gray-500">Serial:</span> {{ selectedAsset?.serialNumber || 'N/A' }}</p>
            <p class="text-sm"><span class="text-gray-500">Condition:</span> {{ selectedAsset?.condition }}</p>
            <p class="text-sm"><span class="text-gray-500">Location:</span> {{ selectedAsset?.location?.building || 'N/A' }}</p>
            <p class="text-sm"><span class="text-gray-500">Department:</span> {{ selectedAsset?.department || 'N/A' }}</p>
          </div>
          <div class="space-y-3">
            <h4 class="font-medium border-b pb-1">Financial Summary</h4>
            <p class="text-sm"><span class="text-gray-500">Acquisition Date:</span> {{ formatDate(selectedAsset?.acquisitionDate) }}</p>
            <p class="text-sm"><span class="text-gray-500">Acquisition Cost:</span> {{ formatCurrency(selectedAsset?.acquisitionCost) }}</p>
            <p class="text-sm"><span class="text-gray-500">Accumulated Dep:</span> {{ formatCurrency(selectedAsset?.accumulatedDepreciation) }}</p>
            <p class="text-sm"><span class="text-gray-500">Book Value:</span> <strong class="text-green-600">{{ formatCurrency(selectedAsset?.bookValue) }}</strong></p>
            <p class="text-sm"><span class="text-gray-500">Salvage Value:</span> {{ formatCurrency(selectedAsset?.salvageValue) }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button @click="openAssetModal(selectedAsset)" class="px-4 py-2 border rounded-lg">Edit</button>
          <button @click="showDetailModal = false" class="px-4 py-2 bg-gray-600 text-white rounded-lg">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { debounce } from 'lodash';
import financeService from '@/services/financeService';

const assets = ref([]);
const dashboard = ref({ totals: {}, categoryStats: [] });
const depreciationSchedule = ref([]);
const processing = ref(false);
const showReports = ref(false);
const showAssetModal = ref(false);
const showDisposeModal = ref(false);
const showDepreciationModal = ref(false);
const showDetailModal = ref(false);
const editingAsset = ref(null);
const selectedAsset = ref(null);

const filters = reactive({ search: '', category: '', status: '' });
const pagination = reactive({ page: 1, limit: 20, total: 0, pages: 0 });

const assetForm = reactive({
  name: '', category: 'equipment', description: '', serialNumber: '',
  acquisitionDate: '', acquisitionCost: 0, acquisitionMethod: 'purchase',
  depreciationMethod: 'straight_line', usefulLifeYears: 5, salvageValue: 0, depreciationRate: 20,
  location: { building: '' }, department: '', condition: 'good'
});

const disposeForm = reactive({ method: 'sale', date: '', proceeds: 0, reason: '' });

const gainLoss = computed(() => (disposeForm.proceeds || 0) - (selectedAsset.value?.bookValue || 0));

onMounted(() => { loadDashboard(); loadAssets(); });

const loadDashboard = async () => {
  try {
    const res = await financeService.getFixedAssetsDashboard();
    dashboard.value = res.data;
  } catch (error) { console.error('Failed to load dashboard:', error); }
};

const loadAssets = async () => {
  try {
    const res = await financeService.getFixedAssets({ ...filters, page: pagination.page, limit: pagination.limit });
    assets.value = res.data;
    Object.assign(pagination, res.pagination);
  } catch (error) { console.error('Failed to load assets:', error); }
};

const debouncedSearch = debounce(() => loadAssets(), 300);
const clearFilters = () => { Object.assign(filters, { search: '', category: '', status: '' }); loadAssets(); };
const changePage = (delta) => { pagination.page += delta; loadAssets(); };

const openAssetModal = (asset = null) => {
  editingAsset.value = asset;
  if (asset) {
    Object.assign(assetForm, {
      name: asset.name, category: asset.category, description: asset.description,
      serialNumber: asset.serialNumber, acquisitionDate: asset.acquisitionDate?.split('T')[0],
      acquisitionCost: asset.acquisitionCost, acquisitionMethod: asset.acquisitionMethod,
      depreciationMethod: asset.depreciationMethod, usefulLifeYears: asset.usefulLifeYears,
      salvageValue: asset.salvageValue, depreciationRate: asset.depreciationRate,
      location: asset.location || { building: '' }, department: asset.department, condition: asset.condition
    });
  } else { resetAssetForm(); }
  showAssetModal.value = true;
};

const saveAsset = async () => {
  try {
    if (editingAsset.value) {
      await financeService.updateFixedAsset(editingAsset.value._id, assetForm);
    } else {
      await financeService.createFixedAsset(assetForm);
    }
    showAssetModal.value = false;
    loadAssets(); loadDashboard();
  } catch (error) { console.error('Failed to save asset:', error); alert(error.message); }
};

const viewAsset = async (asset) => {
  try {
    const res = await financeService.getFixedAsset(asset._id);
    selectedAsset.value = res.data;
    showDetailModal.value = true;
  } catch (error) { console.error('Failed to load asset:', error); }
};

const openDisposeModal = (asset) => {
  selectedAsset.value = asset;
  Object.assign(disposeForm, { method: 'sale', date: new Date().toISOString().split('T')[0], proceeds: 0, reason: '' });
  showDisposeModal.value = true;
};

const disposeAsset = async () => {
  try {
    await financeService.disposeFixedAsset(selectedAsset.value._id, disposeForm);
    showDisposeModal.value = false;
    loadAssets(); loadDashboard();
  } catch (error) { console.error('Failed to dispose asset:', error); alert(error.message); }
};

const openDepreciationModal = async (asset) => {
  try {
    const res = await financeService.getDepreciationSchedule(asset._id);
    selectedAsset.value = asset;
    depreciationSchedule.value = res.data.schedule || [];
    showDepreciationModal.value = true;
  } catch (error) { console.error('Failed to load schedule:', error); }
};

const canProcessPeriod = (idx) => {
  if (idx === 0) return true;
  return depreciationSchedule.value[idx - 1]?.isProcessed;
};

const processDepreciation = async (periodIndex) => {
  try {
    await financeService.processDepreciation(selectedAsset.value._id, periodIndex);
    const res = await financeService.getDepreciationSchedule(selectedAsset.value._id);
    depreciationSchedule.value = res.data.schedule || [];
    loadAssets(); loadDashboard();
  } catch (error) { console.error('Failed to process:', error); alert(error.message); }
};

const runBulkDepreciation = async () => {
  if (!confirm('Run depreciation for all eligible assets up to today?')) return;
  try {
    processing.value = true;
    const res = await financeService.bulkProcessDepreciation({ asOfDate: new Date().toISOString() });
    alert(`Processed: ${res.data.processed}, Total depreciation: ${formatCurrency(res.data.totalDepreciation)}`);
    loadAssets(); loadDashboard();
  } catch (error) { console.error('Failed:', error); alert(error.message); }
  finally { processing.value = false; }
};

const generateReport = (type) => { alert(`${type} report - would generate/download`); };

const resetAssetForm = () => {
  Object.assign(assetForm, {
    name: '', category: 'equipment', description: '', serialNumber: '',
    acquisitionDate: '', acquisitionCost: 0, acquisitionMethod: 'purchase',
    depreciationMethod: 'straight_line', usefulLifeYears: 5, salvageValue: 0, depreciationRate: 20,
    location: { building: '' }, department: '', condition: 'good'
  });
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '';
const formatCurrency = (v) => v != null ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00';

const getStatusClass = (status) => ({
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  under_maintenance: 'bg-yellow-100 text-yellow-800',
  disposed: 'bg-red-100 text-red-800',
  sold: 'bg-blue-100 text-blue-800',
  written_off: 'bg-orange-100 text-orange-800'
}[status] || 'bg-gray-100 text-gray-800');
</script>
