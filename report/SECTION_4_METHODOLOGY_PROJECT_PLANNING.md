# 4. Methodology and Project Planning

## 4.1 Development Methodology

**Chosen Methodology:** Agile Scrum was selected to accommodate evolving requirements and enable rapid iteration on novel technology integration (WebSocket real-time systems, Gemini AI, live streaming commerce).

**Practical Application:** Two-week sprint cycles structure development: Week 1 (Sprint Planning) defines objectives from backlog prioritized via MoSCoW (Must/Should/Could); Week 2 (Implementation & Daily Standups) delivers features with daily 15-minute synchronization meetings identifying blockers; Week 2 Conclusion (Sprint Review & Retrospective) demonstrates working increments to stakeholders and identifies process improvements. Over the 10-month project duration, approximately 20 two-week sprints enable comprehensive feature development with iterative refinement and quality assurance. Continuous Integration via daily commits to Git prevents integration bottlenecks. Automated testing (Jest for backend, Vitest for frontend) validates functionality continuously, targeting ≥70% code coverage for critical business logic. Product backlog prioritized by business value and dependency relationships. Definition of Done: code reviewed (peer review), unit/integration tests passing (≥70% coverage), documented (inline comments and Swagger specs), deployed to staging environment, approved by product owner before production release. This iterative approach enables course correction—if live streaming proves technically challenging, sprints can reallocate resources; if AI recommendations underperform, iterations can refine integration logic; if Skin Study feature encounters complexity, iterations can refine implementation strategy.

---

## 4.2 Project Plan & Timeline

**Project Phases & Milestones:**

### Phase 1: Planning & Design (Weeks 1–4)
- **Deliverables:** Requirements finalization, system architecture diagram, entity-relationship diagrams (database schema), REST API specification (Swagger), UI wireframes for admin/customer/mobile interfaces, technical prototype validating critical components (JWT authentication, WebSocket connection, Gemini AI integration, voice chat infrastructure), infrastructure setup, development environment configuration.
- **Key Milestone:** Technical Validation Complete—proof that core technologies integrate without insurmountable blockers; infrastructure ready for development.

### Phase 2: Backend & Frontend Foundation (Weeks 5–12)
- **Weeks 5–8 (Backend Foundation - Phase 1):** Express.js application structure, MongoDB schema implementation, JWT authentication, core API endpoints (auth, products, orders), Swagger documentation, database indexing strategy.
- **Weeks 9–12 (Frontend & Mobile Foundation):** Vue.js project initialization, component library (buttons, cards, modals, forms), customer interface foundation, admin dashboard skeleton, React Native mobile app setup with navigation structure, responsive design implementation.
- **Key Milestone:** MVP Backend Complete—API endpoints operational with authentication; MVP Frontend Complete—basic navigation and product browsing functional; Mobile Foundation Complete—navigation and basic UI structure.

### Phase 3: Feature Implementation - Phase 1 (Weeks 13–18)
- **Deliverables:** Gemini AI chatbot integration with conversation history and staff escalation, email marketing system foundation with customer segmentation, real-time analytics dashboards (sales, product performance), WebSocket infrastructure setup for live streaming, real-time communication testing, database optimization.
- **Key Milestone:** Core Features Complete—personalization, analytics, and real-time infrastructure operational.

### Phase 4: Advanced Features - Phase 1 (Weeks 19–24)
- **Deliverables:** Live streaming implementation (video streaming, concurrent viewer support, real-time chat, product pinning), business modules foundation (analytics, finance, HR), mobile app feature expansion, Qdrant vector database setup for RAG (Retrieval-Augmented Generation).
- **Key Milestone:** Live Commerce Operational—live streaming with viewer engagement metrics functional; Business Modules Foundation Complete.

### Phase 5: Advanced Features - Phase 2 & Integration (Weeks 25–32)
- **Deliverables:** Skin Study feature with AI dermatology expert (text chat, voice chat with speech-to-text, image analysis with AI-powered assessment), business modules completion (marketing campaigns, email templates, customer segmentation), mobile app completion for both customer and admin, comprehensive integration testing, security validation (OWASP Top 10, penetration testing), performance optimization.
- **Key Milestone:** Skin Study Complete—AI dermatology consultation operational across web and mobile; Business Modules Complete—all financial, HR, and marketing features operational; Advanced Features Complete; Security Validation Complete.

### Phase 6: Testing, Documentation & Deployment (Weeks 33–40)
- **Deliverables:** Unit testing (Jest/Vitest) across all modules, integration testing (API contract validation), user acceptance testing with 5-10 test users, vulnerability scanning (SNYK), API documentation (Swagger), deployment guides, technical architecture documentation, Skin Study integration guide, user manuals, Docker containerization, final quality assurance and bug fixes.
- **Key Milestone:** Production Deployment—platform live and accessible; Documentation Complete; User Satisfaction Feedback gathered; All features validated and tested.

**Visual Timeline (Gantt Chart Summary):**

```
Week    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40
Phase 1 |==========|
         Planning & Design
                        Phase 2 |==========================|
                         Backend & Frontend Foundation
                                                Phase 3 |==========================|
                                                 Feature Implementation - Phase 1
                                                                        Phase 4 |==========================|
                                                                         Advanced Features - Phase 1
                                                                                               Phase 5 |==========================|
                                                                                                Advanced Features - Phase 2 & Integration
                                                                                                                              Phase 6 |==========================|
                                                                                                                               Testing, Documentation & Deployment
```

**Key Dependencies & Risk Buffers:**
- Phase 1 outputs (API spec, wireframes, infrastructure) required before Phase 2 begins.
- Phase 2 backend completion (Weeks 5-8) prerequisite for Phase 3 integration (Weeks 13-18).
- Phase 3 WebSocket infrastructure (Weeks 13-18) prerequisite for Phase 4 live streaming (Weeks 19-24).
- Phase 4 Qdrant vector database setup prerequisite for Phase 5 Skin Study feature (Weeks 25-32).
- Phase 5 advanced features completion prerequisite for Phase 6 comprehensive testing (Weeks 33-40).
- Buffer weeks: Phase 5 includes 2-week buffer for advanced feature refinement; Phase 6 includes 3-week buffer for UAT revisions and security remediation; Phase 6 final 2 weeks reserved for critical bug fixes and final deployment preparation.

---

## 4.3 Feasibility Analysis

**Technical Feasibility: Strong.** Node.js, Express, MongoDB, Vue.js, React Native are production-grade technologies with extensive community support, documented API integration patterns, and mature SDKs. WebSocket real-time communication is proven architecture (Netflix, Discord, Slack). Gemini AI provides REST API with clear documentation. Solo developer learning curve manageable: WebSocket programming (2-3 days), Expo mobile development (3-5 days), Gemini integration (2-3 days)—learnable within project timeline given quality documentation.

**Temporal Feasibility: Feasible.** Project allocates 40–60 hours weekly over 40 weeks (1,600–2,400 total hours). MVP core functionality (e-commerce, recommendations, analytics) achievable in 600–700 hours; advanced features (live streaming, business modules, Skin Study) require 500–600 hours; mobile app development (customer and admin apps) requires 300–400 hours; testing/documentation/deployment 200–300 hours. Total 1,600–2,000 hours fits within 40-week window with 40-hour weekly buffer for unforeseen challenges (deployment issues, API integration problems, performance optimization, voice chat infrastructure complexity, AI dermatology feature refinement).

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
| **Voice Chat Latency (Skin Study)** | <2 second latency for voice interactions | Enables natural conversation flow; >2s creates awkward pauses in dialogue |
| **Image Analysis Response Time** | <3 seconds for AI skin image analysis | Acceptable for user experience; enables real-time feedback on skin analysis |
| **Feature Completeness** | 100% of Must-have requirements (E-commerce, AI Chat, Skin Study, Live Streaming, Business Modules); 95% of Should-have features; 50% of Could-have features | Prioritization ensures critical functionality ships on time; secondary features may defer |
| **Code Quality** | Modular architecture with clear separation of concerns; unit test coverage ≥70% for critical business logic; zero critical security vulnerabilities in vulnerability scanning | Enables future maintenance and reduces operational risk |
| **Specification Compliance** | All acceptance criteria for user stories met; all 35+ API endpoints documented in Swagger | Validates delivery against requirements |
| **Browser/Device Coverage** | Functional on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+; iOS 14+, Android 10+ | Covers 95%+ of target user devices |
| **Mobile App Performance** | Customer and admin React Native apps functional on iOS 14+ and Android 10+ with <3 second load time | Ensures cross-platform accessibility and performance |
| **Uptime During Testing** | 99.5% availability (≤3.6 hours downtime monthly) | Acceptable for production launch; demonstrates reliability |
| **Skin Study Accuracy** | ≥80% test users perceive AI dermatology recommendations as "accurate" or "very accurate" | Validates core Skin Study feature value; critical for user trust |
| **RAG Knowledge Base** | Qdrant vector database with ≥500 curated dermatology knowledge entries indexed | Ensures comprehensive knowledge base for context-aware responses |

### Qualitative Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| **User Satisfaction (UAT Survey)** | 4.0/5.0 average satisfaction; ≥70% users rate platform "Good" or "Excellent" | Subjective user experience perception; 4/5 indicates platform meets expectations |
| **Ease of Use (System Usability Scale)** | SUS score ≥68 (above average); ≥80% users can complete core workflows without assistance | SUS 68+ indicates good usability; workflow completion validates accessibility |
| **AI Chat Personalization Perceived Value** | ≥80% test users perceive AI chat recommendations as "relevant" or "very relevant" | Validates AI Chat core value proposition; if recommendations perceived as generic, feature fails |
| **Skin Study Feature Satisfaction** | ≥80% test users rate Skin Study feature as "helpful" or "very helpful"; ≥75% perceive voice chat as "natural" or "very natural" | Validates Skin Study core value proposition; critical for dermatology consultation credibility |
| **Live Streaming Engagement** | ≥70% live stream viewers maintain attention >10 minutes; ≥30% viewers purchase products during/within 5 minutes of stream | Validates live streaming engagement; conversion rate benchmarks against e-commerce industry 2-3% baseline |
| **Feature Usefulness (Admin Feedback)** | ≥75% admin users rate analytics dashboard, business modules, and consolidated management as "valuable" or "very valuable" | Validates operational consolidation value proposition; if admins still use multiple systems, platform fails core goal |
| **Mobile App User Experience** | ≥75% mobile app users rate app usability as "good" or "excellent"; ≥80% can complete shopping and Skin Study workflows on mobile | Validates cross-platform accessibility and mobile-first design |
| **Developer Documentation Quality** | ≥75% of developers can deploy code changes using documentation without additional assistance; ≥70% comprehension on first reading; Skin Study integration guide enables independent implementation | Enables future development team independence and reduces support burden |
| **Architecture Clarity** | Technical review finds modular design with appropriate separation of concerns; no circular dependencies or God objects; clear separation between AI modules and core platform | Validates codebase maintainability and extensibility |
| **Performance Under Load Satisfaction** | ≥80% test users perceive platform responsiveness as "fast" or "very fast" during normal load; ≥75% perceive live streaming as "smooth" | Subjective performance perception; important for user retention |
| **Business Module Consolidation Value** | ≥80% admin users report reduced time managing multiple platforms; ≥70% report improved operational efficiency | Validates core SME business value proposition; consolidation of 5-8 platforms into one |
| **AI Dermatology Consultation Trust** | ≥85% Skin Study users perceive recommendations as "trustworthy"; ≥80% cite "evidence-based" and "professional" as key satisfaction factors | Validates Skin Study credibility; critical for health-related feature adoption |

---
