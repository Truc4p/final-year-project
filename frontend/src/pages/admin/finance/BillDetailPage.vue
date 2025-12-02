<template>
  <div class="bill-detail p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bill {{ bill?.billNumber || '' }}</h1>
        <p class="text-gray-600">Vendor: {{ vendorName }}</p>
      </div>
      <div class="space-x-2">
        <button @click="goBack" class="px-3 py-2 border rounded-lg">Back</button>
        <button v-if="bill && bill.status==='draft'" @click="approve" class="px-3 py-2 bg-purple-600 text-white rounded-lg">Approve</button>
        <button v-if="bill && bill.status==='approved' && !bill.isPosted" @click="post" class="px-3 py-2 bg-orange-600 text-white rounded-lg">Post</button>
      </div>
    </div>

    <div v-if="loading" class="bg-white shadow rounded p-6">Loading...</div>
    <div v-else-if="error" class="bg-red-50 text-red-800 border border-red-200 rounded p-4">{{ error }}</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <!-- Summary -->
        <div class="bg-white rounded shadow p-6">
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <div class="text-gray-500">Bill Number</div>
              <div class="font-medium">{{ bill.billNumber }}</div>
            </div>
            <div>
              <div class="text-gray-500">Status</div>
              <span :class="statusClass(bill.status)" class="px-2 py-1 rounded text-xs font-semibold">{{ bill.status }}</span>
            </div>
            <div>
              <div class="text-gray-500">Bill Date</div>
              <div class="font-medium">{{ formatDate(bill.billDate) }}</div>
            </div>
            <div>
              <div class="text-gray-500">Due Date</div>
              <div class="font-medium">{{ formatDate(bill.dueDate) }}</div>
            </div>
            <div>
              <div class="text-gray-500">Payment Terms</div>
              <div class="font-medium">{{ bill.paymentTerms }}</div>
            </div>
            <div>
              <div class="text-gray-500">Currency</div>
              <div class="font-medium">{{ bill.currency }}</div>
            </div>
          </div>
        </div>

        <!-- Line Items -->
        <div class="bg-white rounded shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Line Items</h2>
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-3 py-2">#</th>
                <th class="text-left px-3 py-2">Description</th>
                <th class="text-right px-3 py-2">Qty</th>
                <th class="text-right px-3 py-2">Unit Cost</th>
                <th class="text-right px-3 py-2">Tax %</th>
                <th class="text-left px-3 py-2">Account</th>
                <th class="text-right px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="li in bill.lineItems" :key="li._id" class="border-t">
                <td class="px-3 py-2">{{ li.lineNumber }}</td>
                <td class="px-3 py-2">{{ li.description }}</td>
                <td class="px-3 py-2 text-right">{{ li.quantity }}</td>
                <td class="px-3 py-2 text-right">${{ fmt(li.unitCost) }}</td>
                <td class="px-3 py-2 text-right">{{ li.taxRate }}%</td>
                <td class="px-3 py-2">{{ accountDisplay(li.expenseAccount) }}</td>
                <td class="px-3 py-2 text-right">${{ fmt(li.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals & Journal -->
      <div class="space-y-6">
        <div class="bg-white rounded shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Totals</h2>
          <div class="text-sm space-y-1">
            <div class="flex justify-between"><span class="text-gray-600">Subtotal</span><span class="font-medium">${{ fmt(bill.subtotal) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Tax</span><span class="font-medium">${{ fmt(bill.totalTax) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Shipping</span><span class="font-medium">${{ fmt(bill.shippingCost) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Adjustments</span><span class="font-medium">${{ fmt(bill.adjustments) }}</span></div>
            <div class="flex justify-between text-base mt-2"><span>Total</span><span class="font-semibold">${{ fmt(bill.totalAmount) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Paid</span><span class="font-medium">${{ fmt(bill.amountPaid) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Due</span><span class="font-medium">${{ fmt(bill.amountDue) }}</span></div>
          </div>
        </div>

        <div class="bg-white rounded shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Journal</h2>
          <div v-if="bill.isPosted && bill.journalEntry" class="text-sm text-gray-700">
            <div class="mb-2">Entry #: <span class="font-medium">{{ bill.journalEntry.entryNumber || bill.journalEntry }}</span></div>
            <router-link
              class="text-blue-600 hover:text-blue-800 text-sm"
              :to="{ path: '/admin/finance/general-ledger', query: { entryNumber: bill.journalEntry.entryNumber || '' } }"
            >
              View in General Ledger →
            </router-link>
          </div>
          <div v-else class="text-sm text-gray-500">No journal entry yet.</div>
        </div>

        <div class="bg-white rounded shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Metadata</h2>
          <div class="text-sm text-gray-700 space-y-1">
            <div>Created: {{ formatDate(bill.createdAt) }}</div>
            <div>Updated: {{ formatDate(bill.updatedAt) }}</div>
            <div v-if="bill.notes">Notes: {{ bill.notes }}</div>
            <div v-if="bill.memo">Memo: {{ bill.memo }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import financeService from '@/services/financeService';

const route = useRoute();
const router = useRouter();

const bill = ref(null);
const loading = ref(true);
const error = ref(null);

const vendorName = computed(() => {
  const v = bill.value?.vendor;
  if (!v) return '';
  if (typeof v === 'string') return v;
  return v.companyName || v.vendorNumber || '';
});

const fmt = (n) => (Number(n || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 });
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const statusClass = (s) => ({
  'draft': 'bg-gray-100 text-gray-800',
  'pending_approval': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-blue-100 text-blue-800',
  'partial': 'bg-purple-100 text-purple-800',
  'paid': 'bg-green-100 text-green-800',
  'overdue': 'bg-red-100 text-red-800',
  'void': 'bg-gray-200 text-gray-700'
}[s] || 'bg-gray-100 text-gray-800');

const accountDisplay = (acc) => {
  if (!acc) return '';
  if (typeof acc === 'string') return acc;
  return `${acc.accountCode || ''} - ${acc.accountName || ''}`.trim();
};

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    const id = route.params.id;
    const data = await financeService.getBill(id);
    bill.value = data;
  } catch (e) {
    error.value = e?.message || 'Failed to load bill';
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.back();

const approve = async () => {
  try {
    await financeService.approveBill(bill.value._id);
    await load();
  } catch (e) {
    alert(e?.message || 'Failed to approve bill');
  }
};

const post = async () => {
  try {
    await financeService.postBill(bill.value._id);
    await load();
  } catch (e) {
    alert(e?.message || 'Failed to post bill');
  }
};

onMounted(load);
</script>

<style scoped>
</style>

