<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6">
        <button @click="$router.back()" class="text-gray-600 hover:text-gray-900 mb-4">
          ← Back
        </button>
        <h1 class="text-3xl font-bold text-gray-900">{{ isEditing ? 'Edit' : 'Create' }} Referral Program</h1>
      </div>

      <form @submit.prevent="saveProgram" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-bold mb-4">Basic Information</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Program Name *</label>
              <input v-model="program.name" type="text" class="form-input w-full" required />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Description</label>
              <textarea v-model="program.description" class="form-input w-full" rows="3"></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Start Date</label>
                <input v-model="program.startDate" type="datetime-local" class="form-input w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">End Date</label>
                <input v-model="program.endDate" type="datetime-local" class="form-input w-full" />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Status</label>
              <select v-model="program.status" class="form-select w-full">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Referrer Rewards -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Referrer Rewards</h2>
            <label class="flex items-center">
              <input v-model="program.referrerRewards.enabled" type="checkbox" class="rounded mr-2" />
              <span class="text-sm">Enabled</span>
            </label>
          </div>
          
          <div v-if="program.referrerRewards.enabled" class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Reward Type</label>
                <select v-model="program.referrerRewards.rewardType" class="form-select w-full">
                  <option value="discount">Discount</option>
                  <option value="credit">Credit</option>
                  <option value="free_product">Free Product</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Value</label>
                <input v-model.number="program.referrerRewards.rewardValue" type="number" class="form-input w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Unit</label>
                <select v-model="program.referrerRewards.rewardUnit" class="form-select w-full">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Description</label>
              <input v-model="program.referrerRewards.description" type="text" class="form-input w-full" placeholder="e.g., Get 10% off your next purchase" />
            </div>
          </div>
        </div>

        <!-- Referee Rewards -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Referee Rewards (New Customer)</h2>
            <label class="flex items-center">
              <input v-model="program.refereeRewards.enabled" type="checkbox" class="rounded mr-2" />
              <span class="text-sm">Enabled</span>
            </label>
          </div>
          
          <div v-if="program.refereeRewards.enabled" class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Reward Type</label>
                <select v-model="program.refereeRewards.rewardType" class="form-select w-full">
                  <option value="discount">Discount</option>
                  <option value="credit">Credit</option>
                  <option value="free_product">Free Product</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Value</label>
                <input v-model.number="program.refereeRewards.rewardValue" type="number" class="form-input w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Unit</label>
                <select v-model="program.refereeRewards.rewardUnit" class="form-select w-full">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Description</label>
              <input v-model="program.refereeRewards.description" type="text" class="form-input w-full" placeholder="e.g., Welcome! Get 15% off your first order" />
            </div>
          </div>
        </div>

        <!-- Requirements -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-bold mb-4">Requirements & Limits</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Minimum Purchase Amount ($)</label>
              <input v-model.number="program.requirements.minimumPurchaseAmount" type="number" step="0.01" class="form-input w-full" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Max Referrals Per Customer</label>
                <input v-model.number="program.requirements.maxReferralsPerCustomer" type="number" class="form-input w-full" placeholder="0 = unlimited" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Max Rewards Per Customer</label>
                <input v-model.number="program.requirements.maxRewardsPerCustomer" type="number" class="form-input w-full" placeholder="0 = unlimited" />
              </div>
            </div>
          </div>
        </div>

        <!-- Email Templates -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-xl font-bold mb-4">Email Templates</h2>
          
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium">Referral Invite Email</label>
                <label class="flex items-center">
                  <input v-model="program.templates.referralInviteEmail.enabled" type="checkbox" class="rounded mr-2" />
                  <span class="text-sm">Enabled</span>
                </label>
              </div>
              <input v-model="program.templates.referralInviteEmail.subject" type="text" class="form-input w-full mb-2" placeholder="Subject" />
              <textarea v-model="program.templates.referralInviteEmail.body" class="form-input w-full" rows="3" placeholder="Email body..."></textarea>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium">Reward Notification Email</label>
                <label class="flex items-center">
                  <input v-model="program.templates.rewardNotificationEmail.enabled" type="checkbox" class="rounded mr-2" />
                  <span class="text-sm">Enabled</span>
                </label>
              </div>
              <input v-model="program.templates.rewardNotificationEmail.subject" type="text" class="form-input w-full mb-2" placeholder="Subject" />
              <textarea v-model="program.templates.rewardNotificationEmail.body" class="form-input w-full" rows="3" placeholder="Email body..."></textarea>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
          <button type="button" @click="$router.back()" class="btn btn-outline flex-1">Cancel</button>
          <button type="submit" class="btn btn-primary flex-1">
            {{ isEditing ? 'Update Program' : 'Create Program' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { API_URL } from '../../../utils/config';

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => !!route.params.id);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const program = ref({
  name: '',
  description: '',
  status: 'draft',
  startDate: null,
  endDate: null,
  referrerRewards: {
    enabled: true,
    rewardType: 'credit',
    rewardValue: 10,
    rewardUnit: 'fixed',
    description: ''
  },
  refereeRewards: {
    enabled: true,
    rewardType: 'discount',
    rewardValue: 15,
    rewardUnit: 'percentage',
    description: ''
  },
  requirements: {
    minimumPurchaseAmount: 0,
    maxReferralsPerCustomer: 0,
    maxRewardsPerCustomer: 0
  },
  templates: {
    referralInviteEmail: {
      subject: 'Give $10, Get $10!',
      body: 'Share your unique referral link with friends...',
      enabled: true
    },
    referralInviteSMS: {
      body: '',
      enabled: false
    },
    rewardNotificationEmail: {
      subject: 'You\'ve earned a reward!',
      body: 'Congratulations! Your referral was successful...',
      enabled: true
    },
    rewardNotificationSMS: {
      body: '',
      enabled: false
    }
  }
});

const loadProgram = async () => {
  try {
    const response = await axios.get(`${API_URL}/referral/programs/${route.params.id}`, {
      headers: getAuthHeaders()
    });
    if (response.data.success) {
      program.value = response.data.data;
      // Format dates for datetime-local input (yyyy-MM-ddThh:mm)
      if (program.value.startDate) {
        program.value.startDate = new Date(program.value.startDate).toISOString().slice(0, 16);
      }
      if (program.value.endDate) {
        program.value.endDate = new Date(program.value.endDate).toISOString().slice(0, 16);
      }
    }
  } catch (error) {
    console.error('Load program error:', error);
    alert('Failed to load program');
  }
};

const saveProgram = async () => {
  try {
    // Create a copy of the program data
    const programData = { ...program.value };
    
    // Remove fields that shouldn't be sent when updating
    if (isEditing.value) {
      delete programData._id;
      delete programData.__v;
      delete programData.createdAt;
      delete programData.updatedAt;
      delete programData.createdBy;
      delete programData.analytics;
    }
    
    const response = isEditing.value
      ? await axios.put(`${API_URL}/referral/programs/${route.params.id}`, programData, {
          headers: getAuthHeaders()
        })
      : await axios.post(`${API_URL}/referral/programs`, programData, {
          headers: getAuthHeaders()
        });
    
    if (response.data.success) {
      alert(`Program ${isEditing.value ? 'updated' : 'created'} successfully!`);
      router.push('/admin/referral');
    }
  } catch (error) {
    console.error('Save program error:', error);
    console.error('Error response:', error.response?.data);
    alert(error.response?.data?.message || error.response?.data?.errors?.join(', ') || 'Failed to save program');
  }
};

onMounted(() => {
  if (isEditing.value) {
    loadProgram();
  }
});
</script>
