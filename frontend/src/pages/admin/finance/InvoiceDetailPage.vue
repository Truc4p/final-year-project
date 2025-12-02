<template>
  <div class="invoice-detail p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Invoice {{ invoice?.invoiceNumber || '' }}</h1>
        <p class="text-gray-600">Customer: {{ customerName }}</p>
      </div>
      <div class="space-x-2">
        <button @click="goBack" class="px-3 py-2 border rounded-lg">Back</button>
        <button v-if="invoice && !invoice.isPosted" @click="post" class="px-3 py-2 bg-purple-600 text-white rounded-lg">Post</button>
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
              <div class="text-gray-500">Invoice Number</div>
              <div class="font-medium">{{ invoice.invoiceNumber }}</div>
            </div>
            <div>
              <div class="text-gray-500">Status</div>
              <span :class="statusClass(invoice.status)" class="px-2 py-1 rounded text-xs font-semibold">{{ invoice.status }}</span>
            </div>
            <div>
              <div class="text-gray-500">Invoice Date</div>
              <div class="font-medium">{{ formatDate(invoice.invoiceDate) }}</div>
            </div>
            <div>
              <div class="text-gray-500">Due Date</div>
              <div class="font-medium">{{ formatDate(invoice.dueDate) }}</div>
            </div>
            <div>
              <div class="text-gray-500">Payment Terms</div>
              <div class="font-medium">{{ invoice.paymentTerms }}</div>
            </div>
            <div>
              <div class="text-gray-500">Currency</div>
              <div class="font-medium">{{ invoice.currency }}</div>
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
                <th class="text-right px-3 py-2">Unit Price</th>
                <th class="text-right px-3 py-2">Tax %</th>
                <th class="text-left px-3 py-2">Revenue Account</th>
                <th class="text-right px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="li in invoice.lineItems" :key="li._id" class="border-t">
                <td class="px-3 py-2">{{ li.lineNumber }}</td>
                <td class="px-3 py-2">{{ li.description }}</td>
                <td class="px-3 py-2 text-right">{{ li.quantity }}</td>
                <td class="px-3 py-2 text-right">${{ fmt(li.unitPrice) }}</td>
                <td class="px-3 py-2 text-right">{{ li.taxRate }}%</td>
                <td class="px-3 py-2">{{ accountDisplay(li.revenueAccount) }}</td>
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
            <div class="flex justify-between"><span class="text-gray-600">Subtotal</span><span class="font-medium">${{ fmt(invoice.subtotal) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Total Discount</span><span class="font-medium">${{ fmt(invoice.totalDiscount) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Tax</span><span class="font-medium">${{ fmt(invoice.totalTax) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Shipping</span><span class="font-medium">${{ fmt(invoice.shippingCost) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Adjustments</span><span class="font-medium">${{ fmt(invoice.adjustments) }}</span></div>
            <div class="flex justify-between text-base mt-2"><span>Total</span><span class="font-semibold">${{ fmt(invoice.totalAmount) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Paid</span><span class="font-medium">${{ fmt(invoice.amountPaid) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Due</span><span class="font-medium">${{ fmt(invoice.amountDue) }}</span></div>
          </div>
        </div>

        <div class="bg-white rounded shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Journal</h2>
          <div v-if="invoice.isPosted && invoice.journalEntry" class="text-sm text-gray-700">
            <div class="mb-2">Entry #: <span class="font-medium">{{ invoice.journalEntry.entryNumber || invoice.journalEntry }}</span></div>
            <router-link class="text-blue-600 hover:text-blue-800 text-sm" :to="{ path: '/admin/finance/general-ledger', query: { entryNumber: invoice.journalEntry.entryNumber || '' } }">View in General Ledger →</router-link>
          </div>
          <div v-else class="text-sm text-gray-500">No journal entry yet.</div>
        </div>

        <div class="bg-white rounded shadow p-6">
          <h2 class="text-lg font-semibold mb-4">Metadata</h2>
          <div class="text-sm text-gray-700 space-y-1">
            <div>Created: {{ formatDate(invoice.createdAt) }}</div>
            <div>Updated: {{ formatDate(invoice.updatedAt) }}</div>
            <div v-if="invoice.notes">Notes: {{ invoice.notes }}</div>
            <div v-if="invoice.memo">Memo: {{ invoice.memo }}</div>
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

const invoice = ref(null);
const loading = ref(true);
const error = ref(null);

const customerName = computed(() => {
  const c = invoice.value?.customer;
  if (!c) return '';
  if (typeof c === 'string') return c;
  return c.displayName || c.companyName || c.customerNumber || '';
});

const fmt = (n) => (Number(n || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 });
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const statusClass = (s) => ({
  'draft': 'bg-gray-100 text-gray-800',
  'sent': 'bg-blue-100 text-blue-800',
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
    const data = await financeService.getInvoice(id);
    invoice.value = data;
  } catch (e) {
    error.value = e?.message || 'Failed to load invoice';
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.back();

const post = async () => {
  try {
    await financeService.postInvoice(invoice.value._id);
    await load();
  } catch (e) {
    alert(e?.message || 'Failed to post invoice');
  }
};

onMounted(load);
</script>

<style scoped>
</style>

