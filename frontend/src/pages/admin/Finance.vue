<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-12">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-gray-900">Finance Management</h1>
            <p class="text-gray-600 mt-1">Complete SME Finance Platform</p>
          </div>
        </div>
        <p class="text-gray-700 text-lg">Comprehensive financial management system with accounting, invoicing, billing, and bank reconciliation.</p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Todos Completed</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">8/8</p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
              <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Models Created</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">8</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
              <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"></path>
                <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">API Endpoints</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">17+</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
              <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5z"></path>
                <path d="M8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7z"></path>
                <path d="M14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Documentation</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">4300+</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-lg">
              <svg class="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218-.51-4.5-1.385A7.954 7.954 0 009 4.804z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <!-- Completed Todos -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <h2 class="text-2xl font-bold text-white flex items-center space-x-2">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.757a1 1 0 01-.940 1.069 60 60 0 00-3.666-.396c-1.584 0-3.14.155-4.888.561.541 5.108-3.47 8.917-8.854 8.917-1.856 0-3.526-.798-4.667-2.053a1 1 0 001.732-1.155A5.066 5.066 0 015.064 16.3a5.066 5.066 0 001.332-4.226c-3.933.368-7.6-1.537-9.664-5.002a1 1 0 10-1.848.740c2.087 4.364 6.43 7.051 11.313 7.051.822 0 1.643-.079 2.459-.237.956-4.744.73-8.885-.667-10.708 0-.063 0-.126.006-.188a3.066 3.066 0 002.812-3.062v-6.757z" clip-rule="evenodd"></path>
                </svg>
                <span>Completed Finance Todos</span>
              </h2>
            </div>

            <div class="p-6">
              <div class="space-y-4">
                <!-- Todo Items -->
                <div v-for="(todo, index) in completedTodos" :key="index" class="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                  <div class="flex-shrink-0 pt-1">
                    <div class="flex items-center justify-center h-6 w-6 rounded-full bg-green-500">
                      <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-900 font-medium">{{ todo.title }}</p>
                    <p class="text-gray-600 text-sm mt-1">{{ todo.description }}</p>
                    <div class="flex items-center space-x-2 mt-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCategoryClass(todo.category)">
                        {{ todo.category }}
                      </span>
                      <span class="text-xs text-gray-500">✓ Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Sidebar -->
        <div class="space-y-6">
          <!-- Module Breakdown -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5z"></path>
                <path d="M8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7z"></path>
                <path d="M14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
              </svg>
              <span>Module Breakdown</span>
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-700">Accounts Receivable</span>
                <span class="text-sm font-semibold text-green-600">2/2</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" style="width: 100%"></div>
              </div>

              <div class="flex items-center justify-between pt-2">
                <span class="text-gray-700">Accounts Payable</span>
                <span class="text-sm font-semibold text-green-600">2/2</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" style="width: 100%"></div>
              </div>

              <div class="flex items-center justify-between pt-2">
                <span class="text-gray-700">Controllers & Routes</span>
                <span class="text-sm font-semibold text-green-600">3/3</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" style="width: 100%"></div>
              </div>

              <div class="flex items-center justify-between pt-2">
                <span class="text-gray-700">Reports & Banking</span>
                <span class="text-sm font-semibold text-green-600">2/2</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" style="width: 100%"></div>
              </div>
            </div>
          </div>

          <!-- Key Features -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.757a1 1 0 01-.940 1.069 60 60 0 00-3.666-.396c-1.584 0-3.14.155-4.888.561.541 5.108-3.47 8.917-8.854 8.917-1.856 0-3.526-.798-4.667-2.053a1 1 0 001.732-1.155A5.066 5.066 0 015.064 16.3a5.066 5.066 0 001.332-4.226c-3.933.368-7.6-1.537-9.664-5.002a1 1 0 10-1.848.740c2.087 4.364 6.43 7.051 11.313 7.051.822 0 1.643-.079 2.459-.237.956-4.744.73-8.885-.667-10.708 0-.063 0-.126.006-.188a3.066 3.066 0 002.812-3.062v-6.757z" clip-rule="evenodd"></path>
              </svg>
              <span>Key Features</span>
            </h3>
            <ul class="space-y-2">
              <li class="flex items-center space-x-2 text-gray-700">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>Invoice Management</span>
              </li>
              <li class="flex items-center space-x-2 text-gray-700">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>Bill Management</span>
              </li>
              <li class="flex items-center space-x-2 text-gray-700">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>Bank Reconciliation</span>
              </li>
              <li class="flex items-center space-x-2 text-gray-700">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>Financial Reports</span>
              </li>
              <li class="flex items-center space-x-2 text-gray-700">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span>Double-Entry Bookkeeping</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Detailed Models Section -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
        <div class="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
          <h2 class="text-2xl font-bold text-white flex items-center space-x-2">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"></path>
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clip-rule="evenodd"></path>
            </svg>
            <span>Finance Models & Components</span>
          </h2>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="model in financeModels" :key="model.id" class="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div class="flex items-center space-x-3 mb-3">
                <div class="p-2 rounded-lg" :class="model.iconBg">
                  <component :is="model.icon" class="w-5 h-5" :class="model.iconColor" />
                </div>
                <h3 class="font-semibold text-gray-900">{{ model.name }}</h3>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ model.description }}</p>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500">{{ model.type }}</span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Done
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Implementation Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Code Statistics -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218-.51-4.5-1.385A7.954 7.954 0 009 4.804z"></path>
            </svg>
            <span>Implementation Statistics</span>
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700 font-medium">Implementation Files</span>
              <span class="text-2xl font-bold text-blue-600">3</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700 font-medium">Documentation Files</span>
              <span class="text-2xl font-bold text-purple-600">10+</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700 font-medium">Lines of Code</span>
              <span class="text-2xl font-bold text-green-600">1,450+</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700 font-medium">Documentation Lines</span>
              <span class="text-2xl font-bold text-orange-600">2,850+</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700 font-medium">API Endpoints</span>
              <span class="text-2xl font-bold text-indigo-600">17+</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="text-gray-700 font-medium">Database Indexes</span>
              <span class="text-2xl font-bold text-red-600">8</span>
            </div>
          </div>
        </div>

        <!-- Technology Stack -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <svg class="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
            <span>Technology Stack</span>
          </h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span class="text-sm font-bold text-green-700">M</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">MongoDB</p>
                <p class="text-sm text-gray-600">Database</p>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span class="text-sm font-bold text-yellow-700">E</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">Express.js</p>
                <p class="text-sm text-gray-600">Backend Framework</p>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-sm font-bold text-blue-700">V</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">Vue 3</p>
                <p class="text-sm text-gray-600">Frontend Framework</p>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span class="text-sm font-bold text-purple-700">M</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">Mongoose</p>
                <p class="text-sm text-gray-600">ODM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 000-2H6V3a1 1 0 01-1-1zm0 0a1 1 0 010-2h4a1 1 0 010 2H5zm7-1a1 1 0 011 1v1h1a1 1 0 100-2h-1V3a1 1 0 01-1-1zm0 0a1 1 0 010-2h4a1 1 0 010 2h-4zM5 5a1 1 0 011 1v1h1a1 1 0 000-2H6V6a1 1 0 01-1-1zm0 0a1 1 0 010-2h4a1 1 0 010 2H5zm7-1a1 1 0 011 1v1h1a1 1 0 100-2h-1V6a1 1 0 01-1-1zm0 0a1 1 0 010-2h4a1 1 0 010 2h-4zM5 9a1 1 0 011 1v1h1a1 1 0 000-2H6v-1a1 1 0 01-1-1zm0 0a1 1 0 010-2h4a1 1 0 010 2H5zm7-1a1 1 0 011 1v1h1a1 1 0 100-2h-1v-1a1 1 0 01-1-1zm0 0a1 1 0 010-2h4a1 1 0 010 2h-4z" clip-rule="evenodd"></path>
          </svg>
          <span>Next Steps & Roadmap</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 class="font-semibold text-gray-900 mb-2">Phase 1: UI Components</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>✓ Create invoice dashboard</li>
              <li>✓ Build bill management UI</li>
              <li>✓ Design reconciliation interface</li>
            </ul>
          </div>
          <div class="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <h4 class="font-semibold text-gray-900 mb-2">Phase 2: Integration</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>✓ Bank API integration</li>
              <li>✓ Transaction import (CSV/OFX)</li>
              <li>✓ Automated reconciliation</li>
            </ul>
          </div>
          <div class="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <h4 class="font-semibold text-gray-900 mb-2">Phase 3: Analytics</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>✓ Financial dashboards</li>
              <li>✓ Advanced reporting</li>
              <li>✓ Forecasting tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const completedTodos = ref([
  {
    title: 'Create Invoice model for Accounts Receivable',
    description: 'Complete MongoDB schema for managing customer invoices with line items, payments, and accounting integration.',
    category: 'Accounts Receivable'
  },
  {
    title: 'Create Bill model for Accounts Payable',
    description: 'Comprehensive model for vendor bills with payment tracking, reconciliation, and GL posting.',
    category: 'Accounts Payable'
  },
  {
    title: 'Create Customer model for AR',
    description: 'Customer management system with contact information, credit terms, and payment history.',
    category: 'Accounts Receivable'
  },
  {
    title: 'Create Vendor model for AP',
    description: 'Vendor management system with payment terms, contact details, and transaction history.',
    category: 'Accounts Payable'
  },
  {
    title: 'Create Invoice Controller & Routes',
    description: 'RESTful API endpoints for invoice CRUD operations, payment processing, and GL integration.',
    category: 'API Development'
  },
  {
    title: 'Create Bill Controller & Routes',
    description: 'Complete API implementation for bill management with payment tracking and reconciliation.',
    category: 'API Development'
  },
  {
    title: 'Create Financial Reports Service',
    description: 'Service layer for generating P&L statements, balance sheets, and cash flow reports.',
    category: 'Reporting'
  },
  {
    title: 'Create BankAccount model',
    description: 'Comprehensive bank account management with transaction tracking, reconciliation, and GL posting.',
    category: 'Banking'
  }
]);

const financeModels = ref([
  {
    id: 1,
    name: 'Invoice',
    description: 'Customer invoices with line items and payment tracking',
    type: 'Model',
    icon: 'DocumentIcon',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 2,
    name: 'Bill',
    description: 'Vendor bills with payment management',
    type: 'Model',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 3,
    name: 'Customer',
    description: 'Customer information and AR tracking',
    type: 'Model',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 4,
    name: 'Vendor',
    description: 'Vendor information and AP tracking',
    type: 'Model',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    id: 5,
    name: 'Chart of Accounts',
    description: 'Account structure for GL',
    type: 'Model',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  {
    id: 6,
    name: 'General Ledger',
    description: 'Transaction log and GL entries',
    type: 'Model',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    id: 7,
    name: 'Journal Entry',
    description: 'Double-entry bookkeeping entries',
    type: 'Model',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  {
    id: 8,
    name: 'BankAccount',
    description: 'Bank account management & reconciliation',
    type: 'Model',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600'
  }
]);

const getCategoryClass = (category) => {
  const classes = {
    'Accounts Receivable': 'bg-blue-100 text-blue-800',
    'Accounts Payable': 'bg-green-100 text-green-800',
    'API Development': 'bg-purple-100 text-purple-800',
    'Reporting': 'bg-orange-100 text-orange-800',
    'Banking': 'bg-cyan-100 text-cyan-800'
  };
  return classes[category] || 'bg-gray-100 text-gray-800';
};
</script>

<style scoped>
/* Smooth animations */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Gradient text effect */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hover effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>

