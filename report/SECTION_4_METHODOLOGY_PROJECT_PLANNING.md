# 4. Methodology and Project Planning

## 4.1 Development Methodology

**Chosen Methodology:** Agile Scrum was selected to accommodate evolving requirements and enable rapid iteration on novel technology integration (WebSocket real-time systems, Gemini AI, live streaming commerce).

**Practical Application:** Two-week sprint cycles structure development: Week 1 (Sprint Planning) defines objectives from backlog prioritized via MoSCoW (Must/Should/Could); Week 2 (Implementation & Daily Standups) delivers features with daily 15-minute synchronization meetings identifying blockers; Week 2 Conclusion (Sprint Review & Retrospective) demonstrates working increments to stakeholders and identifies process improvements. Continuous Integration via daily commits to Git prevents integration bottlenecks. Automated testing (Jest for backend, Vitest for frontend) validates functionality continuously, targeting ≥70% code coverage for critical business logic. Product backlog prioritized by business value and dependency relationships. Definition of Done: code reviewed (peer review), unit/integration tests passing (≥70% coverage), documented (inline comments and Swagger specs), deployed to staging environment, approved by product owner before production release. This iterative approach enables course correction—if live streaming proves technically challenging, sprints can reallocate resources; if AI recommendations underperform, iterations can refine integration logic.

---

## 4.2 Project Plan & Timeline

**Project Duration:** 10 months (~300 working days, accounting for weekends and holidays)

**Project Phases & Milestones:**

### Phase 1: Planning & Design (Weeks 1–3, ~21 days)
- **Deliverables:** Requirements finalization, system architecture diagram, entity-relationship diagrams (database schema), REST API specification (Swagger), UI wireframes for admin/customer/mobile interfaces, technical prototype validating critical components (JWT authentication, WebSocket connection, Gemini AI integration, skin study analysis).
- **Key Milestone:** Technical Validation Complete—proof that core technologies integrate without insurmountable blockers.

### Phase 2: Backend & Frontend Foundation (Weeks 4–9, ~42 days)
- **Weeks 4–6 (Backend):** Express.js application structure, MongoDB schema implementation, JWT authentication, core API endpoints (products, users, orders, skin study), Swagger documentation, WebSocket infrastructure setup.
- **Weeks 7–9 (Frontend/Mobile):** Vue.js project initialization, component library (buttons, cards, modals, forms), customer interface scaffolding, admin dashboard layout, React Native apps (customer + admin) skeleton with navigation, admin livestream mobile interface.
- **Key Milestone:** MVP Backend Complete—API endpoints operational with authentication; MVP Frontend Complete—basic navigation and product browsing functional; Mobile Apps Initialized.

### Phase 3: Core Feature Implementation (Weeks 10–16, ~49 days)
- **Deliverables:** 
  - Gemini AI chatbot integration with conversation history and staff escalation
  - Email marketing system with customer segmentation
  - Real-time analytics dashboards
  - Skin study feature (analysis, recommendations, tracking)
  - Database query optimization
  - Admin mobile app livestream controls and monitoring
- **Key Milestone:** Core Features Complete—personalization, analytics, skin study analysis, and real-time infrastructure operational.

### Phase 4: Advanced Features & Integration (Weeks 17–25, ~56 days)
- **Deliverables:** 
  - Live streaming implementation (video broadcast, product pinning, viewer chat, engagement metrics)
  - Admin mobile app livestream management (broadcast control, viewer analytics, product management during stream)
  - Business modules (financial reporting, HR records, expense tracking)
  - Mobile app feature parity with web
  - Comprehensive security testing (OWASP Top 10, penetration testing)
  - Performance optimization and load testing
- **Key Milestone:** Advanced Features Complete—live commerce and business management operational; Admin Mobile Livestream Fully Functional; Security Validation Complete.

### Phase 5: Testing, Documentation & Deployment (Weeks 26–35, ~70 days)
- **Deliverables:** 
  - Unit testing (Jest/Vitest) with ≥70% code coverage
  - Integration testing (API contract validation)
  - User acceptance testing with 10-15 test users
  - Vulnerability scanning (SNYK)
  - API documentation (Swagger)
  - Deployment guides and runbooks
  - Technical architecture documentation
  - User manuals and admin guides
  - Performance monitoring setup
- **Key Milestone:** Production Deployment—platform live and accessible; Documentation Complete; User Satisfaction Feedback gathered.

### Phase 6: Optimization & Buffer (Weeks 36–40, ~35 days)
- **Deliverables:**
  - Performance optimization based on real-world usage
  - Bug fixes and refinements
  - Additional feature polish
  - Extended UAT if needed
  - Contingency for unforeseen issues
- **Key Milestone:** Production Stability Achieved—all systems running smoothly; Ready for long-term maintenance.

**Visual Timeline (Gantt Chart Summary):**

```
Week    1-3  4-9  10-16  17-25  26-35  36-40
Phase 1 |===|
        Planning & Design
             |======|
             Backend/Frontend Foundation
                    |========|
                    Core Features (incl. Skin Study & Admin Mobile)
                            |========|
                            Advanced Features & Live Commerce
                                     |==========|
                                     Testing/Documentation/Deploy
                                              |====|
                                              Optimization & Buffer

Total: ~300 working days (10 months)
```

**Feature Breakdown by Phase:**

| Feature Category | Phase | Status |
|---|---|---|
| **Must-Have (6 features, ~62 days)** | | |
| E-commerce core (products, orders, checkout) | 2-3 | Foundation |
| User authentication & profiles | 2 | Foundation |
| Gemini AI chatbot | 3 | Core |
| Real-time analytics | 3 | Core |
| Live streaming infrastructure | 3-4 | Core/Advanced |
| Admin dashboard | 2-3 | Foundation/Core |
| **Should-Have (11 features, ~112 days)** | | |
| Skin study analysis & recommendations | 3 | Core |
| Email marketing system | 3 | Core |
| Business modules (Finance, HR) | 4 | Advanced |
| Admin mobile app (general) | 2-4 | Foundation/Advanced |
| Admin mobile livestream controls | 4 | Advanced |
| Customer mobile app | 2-4 | Foundation/Advanced |
| Live streaming engagement features | 4 | Advanced |
| Product recommendations | 3 | Core |
| Customer segmentation | 3 | Core |
| Performance optimization | 4-5 | Advanced/Testing |
| Security hardening | 4-5 | Advanced/Testing |
| **Could-Have (4 features, ~32 days)** | | |
| Advanced AI personalization | 4-5 | Advanced/Testing |
| Multi-language support | 5 | Testing |
| Advanced reporting & exports | 4-5 | Advanced/Testing |
| Social media integration | 5 | Testing |

### MoSCoW Summary

| Priority | Number of Features | Number of Days (Development) | Allocation |
|---|---|---|---|
| Must | 6 | 62 | Core features (essential for MVP) |
| Should | 11 | 112 | High-priority features (enhance value) |
| Could | 4 | 32 | Nice-to-have features (polish & extras) |
| **TOTAL (Development)** | **21** | **206** | ~69% of 10-month project |
| **Remaining Time** | — | **~94 days** | Testing, QA, deployment, documentation, report, buffer |
| **10-Month Project** | — | **~300 days** | Full timeline (10 months × 30 days) |

Notes:
- Development time (206 days) maps primarily to Phases 2–4.
- Remaining time (94 days) aligns with Phases 5–6 (testing, docs, deployment, optimization, buffer).
- Skin study feature and Admin Mobile Livestream are included in Must/Should features, influencing Phase 3–4 scope.

**Key Dependencies & Risk Buffers:**
- Phase 1 outputs (API spec, wireframes) required before Phase 2 begins.
- Phase 2 backend completion prerequisite for Phase 3 integration.
- Phase 3 WebSocket infrastructure prerequisite for Phase 4 live streaming.
- Phase 4 live streaming completion prerequisite for admin mobile livestream features.
- Buffer allocation: Phase 4 includes 1-week buffer for security remediation; Phase 5 includes 2-week buffer for UAT revisions; Phase 6 provides 5-week contingency buffer for unforeseen challenges.

---

## 4.3 Feasibility Analysis

**Technical Feasibility: Strong.** Node.js, Express, MongoDB, Vue.js, React Native are production-grade technologies with extensive community support, documented API integration patterns, and mature SDKs. WebSocket real-time communication is proven architecture (Netflix, Discord, Slack). Gemini AI provides REST API with clear documentation. Solo developer learning curve manageable: WebSocket programming (2-3 days), Expo mobile development (3-5 days), Gemini integration (2-3 days)—learnable within project timeline given quality documentation.

**Temporal Feasibility: Strong.** Project allocates 40–50 hours weekly over 10 months (~300 working days, ~1,200–1,500 total hours). With expanded timeline:
- MVP core functionality (e-commerce, recommendations, analytics, skin study) achievable in 500–600 hours
- Advanced features (live streaming, business modules, admin mobile livestream) require 300–350 hours
- Testing/documentation/deployment/optimization 250–300 hours
- Total 1,050–1,250 hours fits comfortably within 10-month window with 150–450 hour buffer (~10-30% contingency) for unforeseen challenges (deployment issues, API integration problems, performance optimization, security hardening). Expanded timeline enables thorough testing, comprehensive documentation, and quality polish.

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
| **Feature Completeness** | 100% of Must-have requirements (6/6 features); 95% of Should-have (10/11 features); 50% of Could-have (2/4 features) | Prioritization ensures critical functionality ships on time; secondary features may defer |
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
