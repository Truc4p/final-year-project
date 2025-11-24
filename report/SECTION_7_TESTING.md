# 7. Testing

A systematic, multi-layered testing approach was used to validate robustness and reliability across backend services, real-time features, and the Vue frontend. Testing focused on correctness, integration stability, and user experience under realistic scenarios, with defects tracked and retested until closure.

## 7.1 Testing Strategy

Unit Testing targeted individual functions and modules with controlled inputs and mocks. In the backend, core logic in controllers and services (such as data parsing, validation, and error handling) was exercised with representative request payloads and edge cases, while model-level constraints were verified via Mongoose schema validation. Frontend components were verified in isolation for state changes and rendering correctness using test fixtures and mock API responses.

Integration Testing validated interactions between Express routes, middleware, controllers, Mongoose models, and external services. API workflows were exercised end to end using Swagger UI and Postman, covering authentication flows, CRUD operations, file uploads via Multer, real-time WebSocket events for livestreams, and vector/RAG integration paths. Tests confirmed data persistence in MongoDB Atlas and proper response formatting and status codes.

User Acceptance Testing (UAT) was conducted with representative users executing key journeys across authentication, catalog browsing, product creation, checkout-related flows, analytics views, and livestream interactions. Feedback from UAT informed UI copy, validation messages, and usability refinements, ensuring the application met functional expectations and was intuitive to operate.

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

