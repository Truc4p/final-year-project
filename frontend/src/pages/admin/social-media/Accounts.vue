<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Social Media Accounts</h1>
          <p class="text-gray-600 mt-1">Manage your connected social media accounts</p>
        </div>
        <button @click="showConnectModal = true" class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Connect Account
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>

      <div v-else-if="accounts.length === 0" class="bg-white rounded-lg shadow-sm border p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No accounts connected</h3>
        <p class="text-gray-500 mb-4">Connect your social media accounts to start posting</p>
        <button @click="showConnectModal = true" class="btn btn-primary">
          Connect Your First Account
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="account in accounts" :key="account._id" class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
              <div :class="getPlatformColor(account.platform)" class="w-12 h-12 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path v-if="account.platform === 'facebook'" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  <path v-else-if="account.platform === 'instagram'" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  <path v-else-if="account.platform === 'twitter'" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="font-medium text-gray-900 capitalize">{{ account.platform }}</h3>
                <p class="text-sm text-gray-500">{{ account.accountName || account.accountId }}</p>
              </div>
            </div>
            <span :class="account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 text-xs font-medium rounded-full">
              {{ account.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Followers</span>
              <span class="font-medium">{{ formatNumber(account.followersCount) }}</span>
            </div>
            <div v-if="account.lastSyncedAt" class="flex justify-between text-sm">
              <span class="text-gray-500">Last Synced</span>
              <span class="font-medium">{{ formatDate(account.lastSyncedAt) }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="syncAccount(account._id)" class="btn btn-outline btn-sm flex-1">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Sync
            </button>
            <button @click="toggleStatus(account)" :class="account.isActive ? 'btn-outline' : 'btn-primary'" class="btn btn-sm flex-1">
              {{ account.isActive ? 'Disable' : 'Enable' }}
            </button>
            <button @click="deleteAccount(account._id)" class="btn btn-outline btn-sm text-red-600 hover:bg-red-50">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Connect Account Modal -->
    <div v-if="showConnectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">Connect Social Media Account</h3>
            <button @click="showConnectModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="connectAccount" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Platform</label>
              <select v-model="newAccount.platform" class="form-select w-full" required>
                <option value="">Select platform</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Account Name/Username</label>
              <input v-model="newAccount.accountName" type="text" class="form-input w-full" placeholder="e.g., @mybusiness" required />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Account ID</label>
              <input v-model="newAccount.accountId" type="text" class="form-input w-full" placeholder="Platform account ID" required />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Access Token</label>
              <textarea v-model="newAccount.accessToken" class="form-input w-full" rows="3" placeholder="Paste your access token here" required></textarea>
              <div class="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="text-xs text-blue-900">
                  <button @click="showHelp = true" type="button" class="font-medium underline hover:no-underline">
                    Need help getting credentials?
                  </button>
                  <p class="mt-1">Click to see step-by-step instructions for {{ newAccount.platform || 'your platform' }}</p>
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <button type="button" @click="showConnectModal = false" class="btn btn-outline flex-1">Cancel</button>
              <button type="submit" class="btn btn-primary flex-1">Connect</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div v-if="showHelp" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b p-6">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-bold">How to Get {{ getPlatformName(newAccount.platform) }} Credentials</h3>
            <button @click="showHelp = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <!-- Facebook Instructions -->
          <div v-if="newAccount.platform === 'facebook'">
            <div class="prose max-w-none">
              <h4 class="text-lg font-semibold mb-3">📘 Facebook Page Setup</h4>
              
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <p class="text-sm text-yellow-900"><strong>Important:</strong> You need a Facebook Developer Account and a Facebook Page (not personal profile) to get these credentials.</p>
                </div>
              </div>

              <h5 class="font-semibold text-base mb-2">Step 1: Create a Facebook App</h5>
              <ol class="list-decimal pl-5 space-y-2 mb-4">
                <li>Go to <a href="https://developers.facebook.com" target="_blank" class="text-blue-600 underline">developers.facebook.com</a></li>
                <li>Click <strong>"My Apps"</strong> → <strong>"Create App"</strong></li>
                <li>Select <strong>"Business"</strong> as the app type</li>
                <li>Fill in app details:
                  <ul class="list-disc pl-5 mt-1">
                    <li>App Name: e.g., "My Social Media Manager"</li>
                    <li>App Contact Email: Your email</li>
                  </ul>
                </li>
                <li>Click <strong>"Create App"</strong></li>
              </ol>

              <h5 class="font-semibold text-base mb-2">Step 2: Configure Facebook Login</h5>
              <ol class="list-decimal pl-5 space-y-2 mb-4">
                <li>In your app dashboard, find <strong>"Facebook Login"</strong> and click <strong>"Set Up"</strong></li>
                <li>Choose <strong>"Web"</strong> platform</li>
                <li>In the <strong>Site URL</strong> field, enter: <code class="bg-gray-100 px-1 rounded">http://localhost:5173</code> (for development)</li>
                <li>Go to <strong>Settings → Basic</strong>:
                  <ul class="list-disc pl-5 mt-1 space-y-1">
                    <li><strong>App Domains:</strong> <span class="text-red-600 font-medium">Leave this EMPTY for local development</span> (Facebook doesn't accept "localhost" here)</li>
                    <li><strong>Privacy Policy URL:</strong> Required (use any URL like <code class="bg-gray-100 px-1 rounded">http://example.com/privacy</code> for testing)</li>
                    <li><strong>Terms of Service URL:</strong> Optional</li>
                  </ul>
                </li>
                <li>In <strong>Settings → Advanced → Security</strong>, turn OFF <strong>"Require App Secret"</strong> for development</li>
                <li>Go to <strong>Facebook Login → Settings</strong> and add to <strong>Valid OAuth Redirect URIs:</strong>
                  <ul class="list-disc pl-5 mt-1">
                    <li><code class="bg-gray-100 px-1 rounded">http://localhost:5173/</code></li>
                    <li><code class="bg-gray-100 px-1 rounded">https://localhost:5173/</code></li>
                  </ul>
                </li>
              </ol>

              <h5 class="font-semibold text-base mb-2">Step 3: Add Facebook Pages Management (CRITICAL)</h5>
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <p class="text-sm text-red-900 font-semibold">⚠️ If you don't see <code class="bg-white px-1 rounded">pages_manage_posts</code> permission, follow these steps carefully:</p>
              </div>
              <ol class="list-decimal pl-5 space-y-2 mb-4">
                <li>In your app dashboard left sidebar, click <strong>"Use cases"</strong></li>
                <li>Click <strong>"Customize"</strong> on any use case, OR click <strong>"Add use cases"</strong></li>
                <li>Look for and enable: <strong>"Manage Page for Business"</strong> or <strong>"Page Management"</strong></li>
                <li>This will give you access to <code class="bg-gray-100 px-1 rounded">pages_manage_posts</code> permission</li>
                <li><strong>Alternative method:</strong>
                  <ul class="list-disc pl-5 mt-1">
                    <li>Go to <strong>App Dashboard → Products</strong></li>
                    <li>Add <strong>"Facebook Login for Business"</strong> if not already added</li>
                    <li>In left sidebar, find <strong>"App Review → Permissions and Features"</strong></li>
                    <li>Search for <strong>"pages_manage_posts"</strong> and request it</li>
                    <li>For development, it should be instantly available without review</li>
                  </ul>
                </li>
              </ol>

              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-yellow-900"><strong>Note:</strong> If you only see 4 basic permissions in Graph API Explorer, your app is missing the Pages Management feature. Complete Step 3 first before generating tokens.</p>
              </div>

              <h5 class="font-semibold text-base mb-2">Step 4: Get Your Access Token</h5>
              <ol class="list-decimal pl-5 space-y-2 mb-4">
                <li>Go to <a href="https://developers.facebook.com/tools/explorer" target="_blank" class="text-blue-600 underline">Graph API Explorer</a></li>
                <li>In the top right, select <strong>your app</strong> from the "Meta App" dropdown</li>
                <li>Make sure "User Token" is selected (not "Page Token")</li>
                <li>Click the <strong>"4 options selected"</strong> dropdown (or "Add a Permission") to see available permissions</li>
                <li>You should now see and check:
                  <ul class="list-disc pl-5 mt-1 space-y-1">
                    <li>✅ <code class="bg-gray-100 px-1 rounded">pages_show_list</code></li>
                    <li>✅ <code class="bg-gray-100 px-1 rounded">pages_read_engagement</code></li>
                    <li>✅ <code class="bg-gray-100 px-1 rounded font-bold text-red-700">pages_manage_posts</code> (should appear after Step 3)</li>
                    <li>✅ <code class="bg-gray-100 px-1 rounded">business_management</code> (optional but useful)</li>
                  </ul>
                </li>
                <li><strong>If pages_manage_posts is still missing:</strong> Go back to Step 3 and ensure you've enabled "Page Management" use case</li>
                <li>Click <strong>"Generate Access Token"</strong> button (blue button)</li>
                <li>A popup will appear - verify permissions and click <strong>"Continue"</strong></li>
                <li>If asked to choose pages, select the page(s) you want to manage</li>
                <li>Copy the short-lived token that appears (starts with "EAAM...")</li>
              </ol>

              <h5 class="font-semibold text-base mb-2 text-purple-700">Step 4b: Extend Token to 60 Days (REQUIRED)</h5>
              <ol class="list-decimal pl-5 space-y-2 mb-4">
                <li>Go to <a href="https://developers.facebook.com/tools/debug/accesstoken/" target="_blank" class="text-blue-600 underline">Access Token Debugger</a></li>
                <li>Paste your short-lived token</li>
                <li>Click "Debug" and verify all 4 scopes are present (especially <code class="bg-gray-100 px-1 rounded">pages_manage_posts</code>)</li>
                <li>Scroll to bottom and click <strong>"Extend Access Token"</strong> button</li>
                <li>Copy the new extended token (this one lasts 60 days)</li>
                <li>Use this extended token in your app</li>
              </ol>

              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div class="text-sm text-orange-900">
                    <strong>Troubleshooting:</strong> If you get error 1357045 when testing <code class="bg-white px-1 rounded">me/accounts</code>:
                    <ul class="list-disc pl-5 mt-2 space-y-1">
                      <li>Make sure you clicked "Generate Access Token" AND authorized in the popup</li>
                      <li>Verify you have at least one Facebook Page (not just a personal profile)</li>
                      <li>Try logging out of Facebook and back in, then regenerate the token</li>
                      <li>Check that your app is in "Development Mode" (Settings → Basic)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h5 class="font-semibold text-base mb-2">Step 5: Get Account Information</h5>
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <strong>Account Name:</strong>
                  <p class="text-sm text-gray-600 mt-1">Your Facebook Page name (e.g., "@mybusiness" or "My Business Page")</p>
                </div>
                <div>
                  <strong>Account ID:</strong>
                  <p class="text-sm text-gray-600 mt-1">
                    Go to your Facebook Page → <strong>Settings</strong> → <strong>Page Info</strong> → Find "Page ID" (a numeric string like <code class="bg-gray-100 px-1 rounded">123456789012345</code>)
                  </p>
                  <p class="text-sm text-gray-600 mt-1">
                    Or use Graph API Explorer: Query <code class="bg-gray-100 px-1 rounded">me/accounts</code> to see all your pages and their IDs
                  </p>
                </div>
                <div>
                  <strong>Access Token:</strong>
                  <p class="text-sm text-gray-600 mt-1">Paste the token you generated in Step 4</p>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h5 class="font-semibold text-sm mb-2">✅ Test Your Setup:</h5>
                <div class="text-sm text-gray-700 space-y-2">
                  <p><strong>1. Test your token in Graph API Explorer:</strong></p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>Query: <code class="bg-white px-2 py-1 rounded border">me/accounts</code></li>
                    <li>Expected result: List of your Facebook Pages with their <code class="bg-white px-1 rounded">id</code> and <code class="bg-white px-1 rounded">name</code></li>
                    <li>If successful, copy the Page ID from the response</li>
                  </ul>
                  <p class="mt-2"><strong>2. Verify token permissions:</strong></p>
                  <ul class="list-disc pl-5">
                    <li>Use <a href="https://developers.facebook.com/tools/debug/accesstoken/" target="_blank" class="text-blue-600 underline">Access Token Debugger</a></li>
                    <li>Paste your token and check the "Scopes" section shows all 4 permissions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Instagram Instructions -->
          <div v-else-if="newAccount.platform === 'instagram'">
            <div class="prose max-w-none">
              <h4 class="text-lg font-semibold mb-3">📸 Instagram Business Setup</h4>
              
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-yellow-900"><strong>Requirements:</strong> Instagram Business/Creator account connected to a Facebook Page</p>
              </div>

              <ol class="list-decimal pl-5 space-y-3">
                <li>Convert your Instagram to a <strong>Business or Creator account</strong></li>
                <li>Connect it to a Facebook Page</li>
                <li>Follow the Facebook instructions above to create an app</li>
                <li>Add <strong>Instagram Basic Display API</strong> or <strong>Instagram Graph API</strong> product</li>
                <li>Get access token using Graph API Explorer with Instagram permissions:
                  <ul class="list-disc pl-5 mt-2">
                    <li><code class="bg-gray-100 px-1 rounded">instagram_basic</code></li>
                    <li><code class="bg-gray-100 px-1 rounded">instagram_content_publish</code></li>
                    <li><code class="bg-gray-100 px-1 rounded">pages_read_engagement</code></li>
                  </ul>
                </li>
                <li>Use query <code class="bg-gray-100 px-1 rounded">me/accounts</code> to get your Instagram Business Account ID</li>
              </ol>
            </div>
          </div>

          <!-- Twitter Instructions -->
          <div v-else-if="newAccount.platform === 'twitter'">
            <div class="prose max-w-none">
              <h4 class="text-lg font-semibold mb-3">𝕏 Twitter/X Setup</h4>
              
              <ol class="list-decimal pl-5 space-y-3">
                <li>Go to <a href="https://developer.twitter.com" target="_blank" class="text-blue-600 underline">developer.twitter.com</a></li>
                <li>Apply for a developer account (if you don't have one)</li>
                <li>Create a new App in the Developer Portal</li>
                <li>Go to your app's <strong>Keys and tokens</strong> section</li>
                <li>Generate:
                  <ul class="list-disc pl-5 mt-2">
                    <li><strong>Bearer Token</strong> (for API v2) - Use this as Access Token</li>
                    <li>Or <strong>Access Token & Secret</strong> (for API v1.1)</li>
                  </ul>
                </li>
                <li><strong>Account ID:</strong> Your Twitter handle (e.g., @mybusiness)</li>
                <li><strong>Account Name:</strong> Your display name</li>
              </ol>
            </div>
          </div>

          <!-- LinkedIn Instructions -->
          <div v-else-if="newAccount.platform === 'linkedin'">
            <div class="prose max-w-none">
              <h4 class="text-lg font-semibold mb-3">💼 LinkedIn Setup</h4>
              
              <ol class="list-decimal pl-5 space-y-3">
                <li>Go to <a href="https://www.linkedin.com/developers" target="_blank" class="text-blue-600 underline">LinkedIn Developers</a></li>
                <li>Create a new App</li>
                <li>Add LinkedIn Pages as a product</li>
                <li>Request access to necessary permissions:
                  <ul class="list-disc pl-5 mt-2">
                    <li><code class="bg-gray-100 px-1 rounded">r_organization_social</code></li>
                    <li><code class="bg-gray-100 px-1 rounded">w_organization_social</code></li>
                    <li><code class="bg-gray-100 px-1 rounded">rw_organization_admin</code></li>
                  </ul>
                </li>
                <li>Use OAuth 2.0 to get access token</li>
                <li><strong>Account ID:</strong> Your LinkedIn Organization/Page ID</li>
              </ol>
            </div>
          </div>

          <!-- No platform selected -->
          <div v-else>
            <div class="text-center py-8">
              <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-gray-600">Please select a platform first to see specific instructions</p>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t">
            <button @click="showHelp = false" class="btn btn-primary w-full">Got it!</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_URL } from '../../../utils/config';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const accounts = ref([]);
const loading = ref(false);
const showConnectModal = ref(false);
const showHelp = ref(false);
const newAccount = ref({
  platform: '',
  accountName: '',
  accountId: '',
  accessToken: ''
});

const loadAccounts = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}/social-media/accounts`, {
      headers: getAuthHeaders()
    });
    if (response.data.success) {
      accounts.value = response.data.data;
    }
  } catch (error) {
    console.error('Load accounts error:', error);
    alert('Failed to load accounts');
  } finally {
    loading.value = false;
  }
};

const connectAccount = async () => {
  try {
    const response = await axios.post(`${API_URL}/social-media/accounts/connect`, newAccount.value, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      alert('Account connected successfully!');
      showConnectModal.value = false;
      newAccount.value = { platform: '', accountName: '', accountId: '', accessToken: '' };
      loadAccounts();
    }
  } catch (error) {
    console.error('Connect account error:', error);
    alert(error.response?.data?.message || 'Failed to connect account');
  }
};

const syncAccount = async (accountId) => {
  try {
    const response = await axios.post(`${API_URL}/social-media/accounts/${accountId}/sync`, {}, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      alert('Account synced successfully!');
      loadAccounts();
    }
  } catch (error) {
    console.error('Sync account error:', error);
    alert('Failed to sync account');
  }
};

const toggleStatus = async (account) => {
  try {
    if (account.isActive) {
      const response = await axios.post(`${API_URL}/social-media/accounts/${account._id}/disconnect`, {}, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        alert('Account disabled');
        loadAccounts();
      }
    } else {
      // Re-enable by updating
      account.isActive = true;
      alert('Account enabled (refresh to sync)');
      loadAccounts();
    }
  } catch (error) {
    console.error('Toggle status error:', error);
    alert('Failed to update account status');
  }
};

const deleteAccount = async (accountId) => {
  if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;
  
  try {
    const response = await axios.delete(`${API_URL}/social-media/accounts/${accountId}`, {
      headers: getAuthHeaders()
    });
    
    if (response.data.success) {
      alert('Account deleted successfully');
      loadAccounts();
    }
  } catch (error) {
    console.error('Delete account error:', error);
    alert('Failed to delete account');
  }
};

const getPlatformColor = (platform) => {
  const colors = {
    facebook: 'bg-blue-600',
    instagram: 'bg-gradient-to-br from-purple-600 to-pink-500',
    twitter: 'bg-sky-500',
    linkedin: 'bg-blue-700'
  };
  return colors[platform] || 'bg-gray-600';
};

const formatNumber = (num) => {
  return num ? num.toLocaleString() : '0';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const getPlatformName = (platform) => {
  const names = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn'
  };
  return names[platform] || 'Social Media';
};


onMounted(() => {
  loadAccounts();
});
</script>
