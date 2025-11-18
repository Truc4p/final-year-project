# 4. Methodology and Project Planning

## 4.1 Development Methodology

**Chosen Methodology:** Agile Scrum was selected to accommodate evolving requirements and enable rapid iteration on novel technology integration (WebSocket real-time systems, Gemini AI, live streaming commerce).

**Practical Application:** Two-week sprint cycles structure development: Week 1 (Sprint Planning) defines objectives from backlog prioritized via MoSCoW (Must/Should/Could); Week 2 (Implementation & Daily Standups) delivers features with daily 15-minute synchronization meetings identifying blockers; Week 2 Conclusion (Sprint Review & Retrospective) demonstrates working increments to stakeholders and identifies process improvements. Continuous Integration via daily commits to Git prevents integration bottlenecks. Automated testing (Jest for backend, Vitest for frontend) validates functionality continuously, targeting ≥70% code coverage for critical business logic. Product backlog prioritized by business value and dependency relationships. Definition of Done: code reviewed (peer review), unit/integration tests passing (≥70% coverage), documented (inline comments and Swagger specs), deployed to staging environment, approved by product owner before production release. This iterative approach enables course correction—if live streaming proves technically challenging, sprints can reallocate resources; if AI recommendations underperform, iterations can refine integration logic.

---

## 4.2 Project Plan & Timeline

**Project Phases & Milestones:**

### Phase 1: Planning & Design (Weeks 1–3)
- **Deliverables:** Requirements finalization, system architecture diagram, entity-relationship diagrams (database schema), REST API specification (Swagger), UI wireframes for admin/customer/mobile interfaces, technical prototype validating critical components (JWT authentication, WebSocket connection, Gemini AI integration).
- **Key Milestone:** Technical Validation Complete—proof that core technologies integrate without insurmountable blockers.

### Phase 2: Backend & Frontend Foundation (Weeks 4–7)
- **Weeks 4–5 (Backend):** Express.js application structure, MongoDB schema implementation, JWT authentication, core API endpoints (products, users, orders), Swagger documentation.
- **Weeks 6–7 (Frontend/Mobile):** Vue.js project initialization, component library (buttons, cards, modals, forms), customer interface scaffolding, admin dashboard layout, React Native app skeleton with navigation.
- **Key Milestone:** MVP Backend Complete—API endpoints operational with authentication; MVP Frontend Complete—basic navigation and product browsing functional.

### Phase 3: Feature Implementation (Weeks 8–10)
- **Deliverables:** Gemini AI chatbot integration with conversation history and staff escalation, email marketing system with customer segmentation, real-time analytics dashboards, WebSocket infrastructure for live streaming, database query optimization.
- **Key Milestone:** Core Features Complete—personalization, analytics, and real-time infrastructure operational.

### Phase 4: Advanced Features & Integration (Weeks 11–14)
- **Deliverables:** Live streaming implementation (video broadcast, product pinning, viewer chat, engagement metrics), business modules (financial reporting, HR records, expense tracking), mobile app feature parity with web, comprehensive security testing (OWASP Top 10, penetration testing).
- **Key Milestone:** Advanced Features Complete—live commerce and business management operational; Security Validation Complete.

### Phase 5: Testing, Documentation & Deployment (Weeks 15–18)
- **Deliverables:** Unit testing (Jest/Vitest), integration testing (API contract validation), user acceptance testing with 5-10 test users, vulnerability scanning (SNYK), API documentation (Swagger), deployment guides, technical architecture documentation, user manuals.
- **Key Milestone:** Production Deployment—platform live and accessible; Documentation Complete; User Satisfaction Feedback gathered.

**Visual Timeline (Gantt Chart Summary):**

```
Week    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18
Phase 1 |===========|
         Planning & Design
                        Phase 2 |===========|
                         Backend/Frontend
                                    Phase 3 |===========|
                                     Features
                                           Phase 4 |===========|
                                            Advanced
                                                    Phase 5 |===========|
                                                     Testing/Deploy
```

**Key Dependencies & Risk Buffers:**
- Phase 1 outputs (API spec, wireframes) required before Phase 2 begins.
- Phase 2 backend completion prerequisite for Phase 3 integration.
- Phase 4 live streaming depends on Phase 3 WebSocket infrastructure.
- Buffer weeks: Phase 4 includes 1-week buffer for security remediation; Phase 5 includes 2-week buffer for UAT revisions.

---

## 4.3 Feasibility Analysis

**Technical Feasibility: Strong.** Node.js, Express, MongoDB, Vue.js, React Native are production-grade technologies with extensive community support, documented API integration patterns, and mature SDKs. WebSocket real-time communication is proven architecture (Netflix, Discord, Slack). Gemini AI provides REST API with clear documentation. Solo developer learning curve manageable: WebSocket programming (2-3 days), Expo mobile development (3-5 days), Gemini integration (2-3 days)—learnable within project timeline given quality documentation.

**Temporal Feasibility: Feasible.** Project allocates 40–60 hours weekly over 18 weeks (720–1,080 total hours). MVP core functionality (e-commerce, recommendations, analytics) achievable in 500–600 hours; advanced features (live streaming, business modules) require 200–250 hours; testing/documentation/deployment 150–200 hours. Total 850–1,050 hours fits within 18-week window with 30-hour weekly buffer for unforeseen challenges (deployment issues, API integration problems, performance optimization).

**Economic Feasibility: Strong.** Development tools are open-source (Node.js, Vue.js, MongoDB) or free-tier: GitHub (free private repos), Vite (free build tool), Jest (free testing), Sentry (free tier error monitoring). Cloud hosting: MongoDB Atlas free tier supports development; AWS/Google Cloud free tiers accommodate staging deployment. Domain registration (USD 15/year). Zero licensing costs. Production deployment at USD 50–200/month achievable via containerized hosting (AWS Lightsail, Google Cloud Run).

**Operational Feasibility: Strong.** User interface designed for accessibility—no training required for users with basic computer literacy. WCAG 2.1 AA compliance enables screen reader support, keyboard navigation. Modular codebase (separation of concerns) enables future maintenance by other developers. API documentation (Swagger) and technical architecture documentation enable independent troubleshooting. Infrastructure-as-code (Docker, Kubernetes manifests) enables reproducible deployments. Automated CI/CD pipeline (GitHub Actions) enables low-friction deployments.

---

## 4.4 Evaluation Plan & Success Metrics

**Success Criteria Definition:** Quantitative metrics assess technical performance and functional completeness. Qualitative metrics assess user experience and business value perception. Metrics defined upfront before implementation begins, enabling objective post-project evaluation.

### Quantitative Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| **API Performance** | 500ms response time for 95% of requests under 100 concurrent users | Industry standard for user experience; users perceive <500ms as immediate |
| **Database Performance** | 100ms query execution for 90% of operations | Enables rapid dashboard updates and real-time data display |
| **Concurrent Users** | Platform supports 1,000 concurrent users without >10% performance degradation | Validates scalability for SME growth trajectory |
| **Live Streaming Latency** | <5 second latency for 500 concurrent viewers | Enables real-time interaction feeling; >5s creates awkward conversation gaps |
| **Feature Completeness** | 100% of Must-have requirements (5 features); 95% of Should-have (6/7 features); 50% of Could-have (2/3 features) | Prioritization ensures critical functionality ships on time; secondary features may defer |
| **Code Quality** | Modular architecture with clear separation of concerns; unit test coverage ≥70% for critical business logic; zero critical security vulnerabilities in vulnerability scanning | Enables future maintenance and reduces operational risk |
| **Specification Compliance** | All acceptance criteria for user stories met; all API endpoints documented in Swagger | Validates delivery against requirements |
| **Browser/Device Coverage** | Functional on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+; iOS 14+, Android 10+ | Covers 95%+ of target user devices |
| **Uptime During Testing** | 99.5% availability (≤3.6 hours downtime monthly) | Acceptable for production launch; demonstrates reliability |

### Qualitative Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| **User Satisfaction (UAT Survey)** | 4.0/5.0 average satisfaction; ≥70% users rate platform "Good" or "Excellent" | Subjective user experience perception; 4/5 indicates platform meets expectations |
| **Ease of Use (System Usability Scale)** | SUS score ≥68 (above average); ≥80% users can complete core workflows without assistance | SUS 68+ indicates good usability; workflow completion validates accessibility |
| **Personalization Perceived Value** | ≥80% test users perceive AI recommendations as "relevant" or "very relevant" | Validates core value proposition; if recommendations perceived as generic, core feature fails |
| **Feature Usefulness (Admin Feedback)** | ≥75% admin users rate analytics dashboard and consolidated management as "valuable" or "very valuable" | Validates operational consolidation value proposition; if admins still use multiple systems, platform fails core goal |
| **Developer Documentation Quality** | ≥75% of developers can deploy code changes using documentation without additional assistance; ≥70% comprehension on first reading | Enables future development team independence and reduces support burden |
| **Architecture Clarity** | Technical review finds modular design with appropriate separation of concerns; no circular dependencies or God objects | Validates codebase maintainability |
| **Performance Under Load Satisfaction** | ≥80% test users perceive platform responsiveness as "fast" or "very fast" during normal load | Subjective performance perception; important for user retention |
| **Live Streaming Engagement** | ≥70% live stream viewers maintain attention >10 minutes; ≥30% viewers purchase products during/within 5 minutes of stream | Validates core feature engagement; conversion rate benchmarks against e-commerce industry 2-3% baseline |

---
