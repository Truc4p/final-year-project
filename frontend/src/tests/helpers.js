import { mount } from '@vue/test-utils';
import { vi } from 'vitest';

/**
 * Helper function to create a wrapper for Vue components with common options
 */
export function createWrapper(component, options = {}) {
  return mount(component, {
    global: {
      stubs: {
        Teleport: true,
        ...options.stubs
      },
      mocks: {
        $t: (key) => key,
        $route: {
          params: {},
          query: {},
          ...options.routeMock
        },
        $router: {
          push: vi.fn(),
          replace: vi.fn(),
          go: vi.fn(),
          back: vi.fn(),
          ...options.routerMock
        },
        ...options.mocks
      },
      ...options.global
    },
    ...options
  });
}

/**
 * Mock axios instance
 */
export function createMockAxios() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn()
      },
      response: {
        use: vi.fn(),
        eject: vi.fn()
      }
    }
  };
}

/**
 * Wait for component to update
 */
export async function flushPromises() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}

/**
 * Create mock user data
 */
export function createMockUser(overrides = {}) {
  return {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'customer',
    ...overrides
  };
}

/**
 * Create mock JWT token
 */
export function createMockToken(payload = {}) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({
    user: {
      id: '123',
      username: 'testuser',
      role: 'customer'
    },
    iat: Date.now() / 1000,
    exp: (Date.now() / 1000) + 3600,
    ...payload
  }));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

/**
 * Mock localStorage with data
 */
export function mockLocalStorage(data = {}) {
  const store = { ...data };
  
  localStorage.getItem = vi.fn((key) => store[key] || null);
  localStorage.setItem = vi.fn((key, value) => {
    store[key] = value;
  });
  localStorage.removeItem = vi.fn((key) => {
    delete store[key];
  });
  localStorage.clear = vi.fn(() => {
    Object.keys(store).forEach(key => delete store[key]);
  });
  
  return store;
}
