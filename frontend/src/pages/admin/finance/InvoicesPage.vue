<template>
  <div class="invoices-page">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Invoices (Accounts Receivable)</h1>
        <p class="text-gray-600 mt-2">Manage customer invoices and payments</p>
      </div>
      <button @click="showCreateModal = true" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
        + Create Invoice
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search invoices..." 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <select 
          v-model="filters.status" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <input 
          v-model="filters.dateFrom" 
          type="date" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <input 
          v-model="filters.dateTo" 
          type="date" 
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="invoice in filteredInvoices" :key="invoice.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ invoice.invoiceNumber }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ invoice.customer }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-900">${{ invoice.amount.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(invoice.dueDate) }}</td>
            <td class="px-6 py-4 text-sm">
              <span :class="getStatusClass(invoice.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ invoice.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button @click="viewInvoice(invoice.id)" class="text-blue-600 hover:text-blue-800 font-medium">View</button>
              <button @click="editInvoice(invoice.id)" class="text-green-600 hover:text-green-800 font-medium">Edit</button>
              <button @click="deleteInvoice(invoice.id)" class="text-red-600 hover:text-red-800 font-medium">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Create Invoice</h2>
        <form @submit.prevent="submitInvoice" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input v-model="formData.customer" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input v-model="formData.invoiceDate" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input v-model="formData.dueDate" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input v-model.number="formData.amount" type="number" step="0.01" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="formData.description" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button @click="showCreateModal = false" type="button" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Create Invoice</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed } from 'vue';

const { t } = useI18n();

const showCreateModal = ref(false);
const filters = ref({
  search: '',
  status: '',
  dateFrom: '',
  dateTo: ''
});

const formData = ref({
  customer: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  amount: 0,
  description: ''
});

// Sample data
const invoices = ref([
  { id: 1, invoiceNumber: 'INV-001', customer: 'ABC Corp', amount: 5000, dueDate: '2024-02-15', status: 'paid' },
  { id: 2, invoiceNumber: 'INV-002', customer: 'XYZ Inc', amount: 3500, dueDate: '2024-02-20', status: 'sent' },
  { id: 3, invoiceNumber: 'INV-003', customer: 'Tech Solutions', amount: 7200, dueDate: '2024-02-10', status: 'overdue' },
  { id: 4, invoiceNumber: 'INV-004', customer: 'Global Trade', amount: 4100, dueDate: '2024-03-01', status: 'draft' },
  { id: 5, invoiceNumber: 'INV-005', customer: 'Local Services', amount: 2800, dueDate: '2024-02-28', status: 'sent' },
]);

const filteredInvoices = computed(() => {
  return invoices.value.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(filters.value.search.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchesStatus = !filters.value.status || invoice.status === filters.value.status;
    return matchesSearch && matchesStatus;
  });
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusClass = (status) => {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const viewInvoice = (id) => {
  console.log('View invoice:', id);
};

const editInvoice = (id) => {
  console.log('Edit invoice:', id);
};

const deleteInvoice = (id) => {
  invoices.value = invoices.value.filter(inv => inv.id !== id);
};

const submitInvoice = () => {
  const newInvoice = {
    id: invoices.value.length + 1,
    invoiceNumber: `INV-${String(invoices.value.length + 1).padStart(3, '0')}`,
    customer: formData.value.customer,
    amount: formData.value.amount,
    dueDate: formData.value.dueDate,
    status: 'draft'
  };
  invoices.value.push(newInvoice);
  showCreateModal.value = false;
  formData.value = {
    customer: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    description: ''
  };
};
</script>

<style scoped>
.invoices-page {
  padding: 2rem;
}
</style>

