# 7. Testing

## 7.1 Testing Strategy

### Unit Testing 

#### Backend Unit Testing Setup

The backend uses **Jest** as the testing framework with **Supertest** for HTTP assertions. The following test structure was adopted:

**Installation:**
```bash
npm install --save-dev jest supertest @jest/globals
```

**Configuration (package.json):**
```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=tests/unit"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

#### Backend Unit Test Categories

**1. Controller Unit Tests**
- Test individual controller functions in isolation
- Mock database models and external services
- Verify correct HTTP status codes and response structures
- Example test file: `tests/unit/controllers/authController.test.js`

```javascript
const authController = require('../../../controllers/auth/authController');
const User = require('../../../models/auth/user');
const jwt = require('jsonwebtoken');

jest.mock('../../../models/auth/user');
jest.mock('jsonwebtoken');

describe('Auth Controller - registerUser', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        password: 'password123',
        role: 'customer'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  test('should register a new user successfully', async () => {
    User.findOne.mockResolvedValue(null);
    User.prototype.save = jest.fn().mockResolvedValue({
      id: '123',
      username: 'testuser',
      role: 'customer'
    });
    jwt.sign.mockImplementation((payload, secret, options, callback) => {
      callback(null, 'mock-token');
    });

    await authController.registerUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ token: 'mock-token' });
  });

  test('should reject registration if user exists', async () => {
    User.findOne.mockResolvedValue({ username: 'testuser' });

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'User already exists' });
  });

  test('should validate admin key for admin registration', async () => {
    req.body.role = 'admin';
    req.body.adminKey = 'wrong-key';

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid admin key' });
  });
});
```

**2. Model Unit Tests**
- Test model validation rules
- Verify schema constraints and defaults
- Test custom methods and hooks
- Example: `tests/unit/models/user.test.js`

```javascript
const mongoose = require('mongoose');
const User = require('../../../models/auth/user');

describe('User Model', () => {
  test('should hash password before saving', async () => {
    const user = new User({
      username: 'testuser',
      password: 'plaintext',
      role: 'customer'
    });

    const hashedPassword = user.password;
    expect(hashedPassword).not.toBe('plaintext');
    expect(hashedPassword.length).toBeGreaterThan(20);
  });

  test('should require username field', () => {
    const user = new User({ password: 'test123', role: 'customer' });
    const error = user.validateSync();
    
    expect(error.errors.username).toBeDefined();
  });

  test('should default role to customer', () => {
    const user = new User({ username: 'test', password: 'test123' });
    expect(user.role).toBe('customer');
  });
});
```

**3. Middleware Unit Tests**
- Test authentication middleware
- Test authorization and role-based access
- Test error handling middleware
- Example: `tests/unit/middleware/auth.test.js`

```javascript
const authMiddleware = require('../../../middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { header: jest.fn() };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should authenticate valid token', () => {
    req.header.mockReturnValue('Bearer valid-token');
    jwt.verify.mockReturnValue({ user: { id: '123', role: 'admin' } });

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  test('should reject missing token', () => {
    req.header.mockReturnValue(null);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No token, authorization denied' });
  });

  test('should reject invalid token', () => {
    req.header.mockReturnValue('Bearer invalid-token');
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token is not valid' });
  });
});
```

**4. Utility Function Tests**
- Test helper functions (scoreAnalyzer, performanceMonitor)
- Test pure functions with various inputs
- Verify edge cases and error conditions
- Example: `tests/unit/utils/scoreAnalyzer.test.js`

```javascript
const scoreAnalyzer = require('../../../utils/scoreAnalyzer');

describe('Score Analyzer Utility', () => {
  test('should calculate average correctly', () => {
    const scores = [80, 90, 85];
    const average = scoreAnalyzer.calculateAverage(scores);
    expect(average).toBe(85);
  });

  test('should handle empty array', () => {
    const scores = [];
    const average = scoreAnalyzer.calculateAverage(scores);
    expect(average).toBe(0);
  });

  test('should categorize score correctly', () => {
    expect(scoreAnalyzer.categorize(95)).toBe('Excellent');
    expect(scoreAnalyzer.categorize(75)).toBe('Good');
    expect(scoreAnalyzer.categorize(50)).toBe('Average');
  });
});
```

#### Frontend Unit Testing Setup

The frontend uses **Vitest** (Vite's testing framework) with **Vue Test Utils** for component testing.

**Installation:**
```bash
npm install --save-dev vitest @vue/test-utils jsdom @vitest/ui
```

**Configuration (vite.config.js):**
```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
});
```

**Package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### Frontend Unit Test Categories

**1. Component Tests**
- Test component rendering and props
- Test user interactions and events
- Test computed properties and methods
- Example: `tests/unit/components/LoginForm.test.js`

```javascript
import { mount } from '@vue/test-utils';
import { describe, test, expect } from 'vitest';
import LoginForm from '@/components/LoginForm.vue';

describe('LoginForm Component', () => {
  test('renders login form correctly', () => {
    const wrapper = mount(LoginForm);
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  test('validates empty username', async () => {
    const wrapper = mount(LoginForm);
    await wrapper.find('form').trigger('submit');
    expect(wrapper.text()).toContain('Username is required');
  });

  test('emits login event with credentials', async () => {
    const wrapper = mount(LoginForm);
    await wrapper.find('input[type="text"]').setValue('testuser');
    await wrapper.find('input[type="password"]').setValue('password123');
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted('login')).toBeTruthy();
    expect(wrapper.emitted('login')[0]).toEqual([{
      username: 'testuser',
      password: 'password123'
    }]);
  });
});
```

**2. Store/State Management Tests**
- Test Vuex actions and mutations (if applicable)
- Test state changes and getters
- Example: `tests/unit/store/auth.test.js`

**3. Router Tests**
- Test route guards and navigation
- Test authentication-based redirects

**4. Utility/Helper Tests**
- Test formatting functions
- Test validation helpers
- Test API service wrappers

#### Unit Testing Best Practices Applied

1. **Isolation**: Each test is independent and doesn't rely on external services or databases
2. **Mocking**: External dependencies (database, JWT, APIs) are mocked using Jest
3. **Coverage**: Aim for >80% code coverage on critical business logic
4. **Naming**: Descriptive test names following "should + expected behavior" pattern
5. **AAA Pattern**: Arrange-Act-Assert structure for clarity
6. **Fast Execution**: Unit tests run quickly (< 5 seconds total) to enable frequent testing

#### Running Unit Tests

```bash
# Backend
cd backend
npm test                    # Run all tests
npm run test:watch          # Run in watch mode
npm run test:unit           # Run unit tests only

# Frontend
cd frontend
npm test                    # Run all tests
npm run test:ui            # Run with UI interface
npm run test:coverage      # Generate coverage report
```

#### Unit Test Coverage Targets

| Component Type | Target Coverage | Critical Paths |
|---|---|---|
| Controllers | 85% | Authentication, Authorization, Data validation |
| Models | 90% | Validation rules, Hooks, Custom methods |
| Middleware | 95% | Auth, Role checks, Error handling |
| Utilities | 90% | Business logic, Calculations |
| Vue Components | 80% | User interactions, Event handling |
| Services/API | 85% | Request/response handling, Error cases |

#### How to Run Unit Tests - Step-by-Step Guide

**Prerequisites:**
- Node.js installed (v16+ recommended)
- Project dependencies installed
- MongoDB connection configured (for backend tests with database)

---

**BACKEND UNIT TESTS:**

**Step 1: Install Testing Dependencies**
```bash
cd backend
npm install --save-dev jest supertest @jest/globals
```

**Step 2: Update package.json**

Add the following to your `backend/package.json`:

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=tests/unit"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "testMatch": ["**/tests/**/*.test.js"]
  }
}
```

**Step 3: Create Test Directory Structure**
```bash
cd backend
mkdir -p tests/unit/controllers
mkdir -p tests/unit/models
mkdir -p tests/unit/middleware
mkdir -p tests/unit/utils
```

**Step 4: Create Your First Test File**

Create `backend/tests/unit/controllers/authController.test.js` and paste the example code from the documentation above.

**Step 5: Run the Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run only unit tests
npm run test:unit

# Run with verbose output
npm test -- --verbose

# Run a specific test file
npm test -- tests/unit/controllers/authController.test.js
```

**Step 6: View Coverage Report**

After running `npm test`, a coverage report is generated:
- Terminal output shows coverage summary
- HTML report available at `backend/coverage/lcov-report/index.html`
- Open in browser: `open coverage/lcov-report/index.html` (macOS)

**Example Output:**
```
 PASS  tests/unit/controllers/authController.test.js
  Auth Controller - registerUser
    ✓ should register a new user successfully (25ms)
    ✓ should reject registration if user exists (8ms)
    ✓ should validate admin key for admin registration (5ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Coverage:    85.7% Statements | 80.5% Branches | 90.2% Functions
```

---

**FRONTEND UNIT TESTS:**

**Step 1: Install Testing Dependencies**
```bash
cd frontend
npm install --save-dev vitest @vue/test-utils jsdom @vitest/ui
```

**Step 2: Update vite.config.js**

Add test configuration to `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/']
    }
  }
});
```

**Step 3: Update package.json Scripts**

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

**Step 4: Create Test Directory Structure**
```bash
cd frontend
mkdir -p tests/unit/components
mkdir -p tests/unit/views
mkdir -p tests/unit/utils
mkdir -p tests/unit/services
```

**Step 5: Create Your First Component Test**

Create `frontend/tests/unit/components/LoginForm.test.js` with the example code provided above.

**Step 6: Run the Tests**
```bash
# Run tests in watch mode (default)
npm test

# Run tests once (useful for CI/CD)
npm run test:run

# Run with UI interface (interactive browser view)
npm run test:ui

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test LoginForm

# Run tests matching pattern
npm test -- --grep "login"
```

**Step 7: View Results**

- **Watch mode**: Results appear in terminal and auto-update
- **UI mode**: Opens browser at `http://localhost:51204/__vitest__/`
- **Coverage**: HTML report at `frontend/coverage/index.html`

**Example Output:**
```
 ✓ tests/unit/components/LoginForm.test.js (3)
   ✓ LoginForm Component (3)
     ✓ renders login form correctly
     ✓ validates empty username
     ✓ emits login event with credentials

Test Files  1 passed (1)
     Tests  3 passed (3)
  Start at  10:30:15
  Duration  1.24s
```

---

**COMMON TROUBLESHOOTING:**

**Issue: "Cannot find module" errors**
```bash
# Solution: Ensure all dependencies are installed
npm install
```

**Issue: Jest doesn't recognize ES6 imports**
```bash
# Solution: Add to package.json
"jest": {
  "transform": {
    "^.+\\.js$": "babel-jest"
  }
}
# Then install: npm install --save-dev babel-jest @babel/preset-env
```

**Issue: MongoDB connection timeout in tests**
```javascript
// Solution: Mock the database connection
jest.mock('../db', () => ({
  connect: jest.fn().mockResolvedValue(true)
}));
```

**Issue: Tests failing due to environment variables**
```bash
# Solution: Create .env.test file or mock process.env
process.env.JWT_SECRET = 'test-secret';
```

---

**QUICK REFERENCE COMMANDS:**

```bash
# Backend
cd backend
npm install --save-dev jest supertest @jest/globals
npm test                              # Run all tests with coverage
npm run test:watch                    # Watch mode
npm test -- --verbose                 # Verbose output
npm test -- authController            # Run specific test

# Frontend  
cd frontend
npm install --save-dev vitest @vue/test-utils jsdom @vitest/ui
npm test                              # Run in watch mode
npm run test:run                      # Single run
npm run test:ui                       # Interactive UI
npm run test:coverage                 # With coverage report
```

### Integration Testing 

### User Acceptance Testing

## 7.2 Test Cases and Results

| Test ID | Test Description | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| LOGIN-01 | Successful Login | 1. Enter valid username "admin".<br>2. Enter valid password "pass123".<br>3. Click "Login". | User is redirected to the dashboard page. A "Welcome, admin!" message is shown. | User was redirected to the dashboard. The welcome message was displayed. | Pass |
| LOGIN-02 | Failed Login (Wrong Password) | 1. Enter valid username "admin".<br>2. Enter invalid password "wrongpass".<br>3. Click "Login". | An error message "Invalid username or password" appears. User stays on the login page. | The specified error message appeared. The user was not redirected. | Pass |
| LOGIN-03 | Failed Login (Empty Username) | 1. Leave username field empty.<br>2. Enter a password.<br>3. Click "Login". | An error message "Username is required" appears. User stays on the login page. | The specified error message appeared. The user was not redirected. | Pass |
| AUTH-01 | Missing Token Access Denied | 1. POST /products without Authorization header.<br>2. Include valid form data. | 401 with message "No token, authorization denied". | 401 returned with the specified message. | Pass |
| AUTH-02 | Invalid Token Access Denied | 1. POST /products with Authorization: Bearer invalidtoken.<br>2. Include valid form data. | 401 with message "Token is not valid". | 401 returned with invalid token message. | Pass |
| AUTH-03 | Forbidden Role for Product Create | 1. Authenticate as customer.<br>2. POST /products with valid data. | 403 with message "Access denied". | 403 returned as expected. | Pass |
| PROD-01 | Create Product with Image Upload | 1. Authenticate as admin.<br>2. POST /products multipart/form-data with image and JSON array fields (ingredients, skinType, benefits, tags, skinConcerns). | 201 with product JSON; arrays parsed; image path set under /uploads. | 201 returned; arrays populated; image saved and accessible. | Pass |
| PROD-02 | Update Product Replaces Image | 1. Authenticate as admin.<br>2. PUT /products/{id} with new image and updated fields.<br>3. Verify old file removed. | 200 with updated product; old image deleted from disk. | 200 returned; old image removed after successful update. | Pass |
| PROD-03 | Get Product Not Found | 1. GET /products/{nonexistentId}. | 404 with "Product not found". | 404 returned with error message. | Pass |
| PROD-04 | Delete Product Removes Image | 1. Authenticate as admin.<br>2. DELETE /products/{id}.<br>3. Attempt to GET previous image path. | 204 No Content; image no longer available on disk. | 204 returned; image file removed. | Pass |
| PROD-05 | List Products Public | 1. GET /products without authentication. | 200 with array of products. | 200 returned with array. | Pass |
| UPLOAD-01 | Upload Thumbnail Success | 1. Authenticate as admin.<br>2. POST /uploads/thumbnail with a JPEG < 5MB in field "thumbnail". | 200 with filename, path /uploads/thumbnails/{file}, and size. | 200 returned with metadata. | Pass |
| UPLOAD-02 | Upload Thumbnail Invalid Type | 1. Authenticate as admin.<br>2. POST /uploads/thumbnail with GIF file. | Error because only jpeg/jpg/png/webp allowed. | 500 error with message "Only image files are allowed for thumbnails". | Pass |
| UPLOAD-03 | Upload Thumbnail Exceeds Size | 1. Authenticate as admin.<br>2. POST /uploads/thumbnail with file > 5MB. | Error due to size limit. | 500 error returned by Multer size constraint. | Pass |
| LIVE-01 | Get Active Livestream | 1. GET /livestreams/active. | 200 with active livestream metadata when one is active; null otherwise. | Active livestream returned with isActive true. | Pass |
| LIVE-02 | Create Livestream (Admin Only) | 1. POST /livestreams as admin with valid payload.<br>2. Repeat as customer. | 201 for admin; 403 for customer. | 201 for admin; 403 for customer. | Pass |
| LIVE-03 | Increment View Count | 1. POST /livestreams/{id}/view twice. | View count increases by 2. | Counter increased as expected. | Pass |
| LIVE-04 | Pin Product to Livestream | 1. Authenticate as admin.<br>2. POST /livestreams/{id}/pin-product with productId.<br>3. GET /livestreams/{id}/pinned-products. | 200; product appears in pinned list. | Pinned list contained the product. | Pass |
| CHAT-01 | List FAQs | 1. GET /chat/faqs. | 200 with list of FAQs filtered by optional category/limit. | 200 returned with expected structure. | Pass |
| CHAT-02 | AI Chat Fallback Without Key | 1. Ensure GEMINI_API_KEY unset.<br>2. POST /chat/ai with message. | 200 with fallback AI response and metadata fields present. | 200 returned; fallback response provided. | Pass |
| CHAT-03 | Create FAQ Requires Auth | 1. POST /chat/admin/faq without token.<br>2. Repeat with admin token and valid body. | 401 without token; 201 with admin token. | Behaved as expected. | Pass |
| CHAT-04 | Staff Reply Requires Auth | 1. POST /chat/admin/reply without token.<br>2. Repeat with admin token. | 401 without token; 200 with admin token. | Behaved as expected. | Pass |
| PAYMENT-01 | Create VNPay Payment URL (Customer) | 1. Authenticate as customer.<br>2. POST /payments/vnpay/create with order info. | 200 with payment URL for redirect. | 200 returned with VNPay URL. | Pass |
| PAYMENT-02 | Create VNPay Payment URL (Wrong Role) | 1. Authenticate as admin.<br>2. POST /payments/vnpay/create. | 403 due to role(["customer"]). | 403 returned. | Pass |
| PAYMENT-03 | VNPay Return Handling | 1. Simulate GET /payments/vnpay/return with sandbox parameters. | 200 and order status updated according to VNPay response. | Handled and returned expected structure. | Pass |
| SECURITY-01 | Rate Limiting Applied | 1. Send > max allowed requests within window to same endpoint. | 429 Too Many Requests returned after threshold. | 429 returned when threshold exceeded. | Pass |
| STATIC-01 | Serve Uploaded Asset | 1. GET /uploads/{existing-file}. | 200 and binary file response. | 200 returned file successfully. | Pass |
| DOCS-01 | Swagger UI Available | 1. Navigate to /api-docs. | 200 with interactive API documentation. | Swagger UI loaded successfully. | Pass |
| FRONTEND-01 | Locale Switch Updates UI | 1. Open app.<br>2. Switch language in UI (via Vue i18n). | Visible strings update without page reload. | UI strings updated immediately. | Pass |
| FRONTEND-02 | Charts Render | 1. Navigate to analytics page.<br>2. Verify charts appear with data. | Chart.js/Vue Chart.js render datasets without errors. | Charts displayed correctly. | Pass |

