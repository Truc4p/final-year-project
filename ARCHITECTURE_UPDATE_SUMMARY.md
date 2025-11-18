# Architecture Documentation Updates - Summary

## Date: 2024
## Document Updated: `SECTION_5_SYSTEM_DESIGN_ARCHITECTURE.md`

---

## Updates Made

### 1. **REST API Gateway vs Auth Service: Architecture Clarification** (NEW SECTION)
**Location:** After "Architecture Layers Explained" table

**What was added:**
- Clear distinction between REST API Gateway and Auth Service as two separate components
- Detailed comparison table showing responsibilities, technologies, and functions of each
- Step-by-step data flow explaining how they work together
- Visual diagram showing request flow through middleware
- Explanation of why both are necessary for system operation

**Key Clarifications:**
- ✅ **REST API Gateway** = Infrastructure/Middleware layer (routing, CORS, auth middleware)
- ✅ **Auth Service** = Business logic layer (user registration, login, JWT generation)
- ✅ Both are **necessary and separate** - removing either breaks the system
- ✅ Auth middleware in REST API Gateway verifies tokens created by Auth Service

---

### 2. **8 Backend Services: Detailed Breakdown** (RESTRUCTURED & EXPANDED)
**Location:** Section 5.2 - Following Container Diagram

**What was added:**
- New comprehensive table listing all 8 backend services with:
  - Clear responsibility descriptions
  - Key data models used
  - Available routes
  - External dependencies
- **Dedicated subsection: "Communication Service & AI Integration"**
  - Clarifies that there is NO separate AI Service
  - AI functionality is fully integrated into Communication Service
  - Shows exactly how Google Gemini API is consumed
  - Detailed 8-step data flow explaining the complete process
  - Lists all available routes with descriptions

**Key Clarifications:**
- ✅ **NO separate AI Service** exists in architecture
- ✅ **AI is a feature of Communication Service**, not a standalone service
- ✅ Communication Service owns ALL communication logic (chat, FAQs, AI responses)
- ✅ Google Gemini API is an **external dependency**, not a microservice
- ✅ **Scalability model**: Communication Service can scale independently; Google Gemini API handles AI computations

---

## Architecture Layers Clarification

### Updated Architecture Layers Table:
| Layer | Components | Responsibility |
|---|---|---|
| **Frontend Layer** | Web Frontend (Vue.js), Mobile App (React Native) | User interfaces for customers and admins |
| **Backend Layer (API Gateway)** | REST API Gateway (Express.js) | Request routing, CORS, rate limiting, auth middleware verification |
| **Backend Layer (Services)** | 8 Backend Services | Business logic implementation (including **Auth Service** and **Communication Service**) |
| **Data Layer** | MongoDB Atlas Database | Persistent data storage |

### Key Architecture Patterns Established:

**1. Authentication Flow:**
- Auth Service **creates** JWT tokens (registration, login)
- REST API Gateway middleware **validates** JWT tokens on protected routes
- Other services **receive** validated user context from middleware

**2. Communication & AI Flow:**
- Communication Service **owns** all chat functionality
- Google Gemini API **provides** AI capabilities
- Both work together seamlessly within one service

**3. Microservices Communication:**
- All services communicate through REST API Gateway
- Services access shared MongoDB database
- Each service is independently deployable

---

## Files Modified

### Main Documentation File:
- `/Users/phamthanhtruc/Documents/uni/FYP-c1682/wrencos/SECTION_5_SYSTEM_DESIGN_ARCHITECTURE.md`

### Changes Made:
1. Added new section: "REST API Gateway vs Auth Service: Architecture Clarification" (~100 lines)
2. Restructured and expanded: "8 Backend Services: Detailed Breakdown" (~50 lines expanded)
3. Replaced outdated "Communication Service vs AI Service" section with accurate implementation details

---

## Validation

✅ **REST API Gateway and Auth Service** are now clearly distinguished as separate components
✅ **Communication Service and AI** relationship is clarified (AI is integrated, not separate)
✅ **Data flows** are documented with 8-step process for chat/AI interactions
✅ **Dependencies** are clearly listed for each service
✅ **Architecture patterns** are consistent with C4 model diagrams

---

## Impact on Other Sections

These updates enhance understanding for:
- Section 5.2: System Architecture (C4 Diagrams)
- Section 5.3: Technology Stack (dependencies now match documented services)
- Section 5.4: Detailed Design Diagrams
- All sections referencing authentication or communication services

---

## Recommendations for Future Updates

1. **Add sequence diagrams** for user registration and token validation flows
2. **Add deployment documentation** showing how the REST API Gateway and individual services are deployed
3. **Add API endpoint documentation** with example requests/responses for each service
4. **Consider adding** WebSocket protocol documentation for real-time features
5. **Document scaling strategy** for high-concurrency Communication Service scenarios

