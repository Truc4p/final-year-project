# 4. Methodology and Project Planning

## 4.1 Development Methodology

This project adopted **Agile Scrum** methodology to enable iterative development, continuous stakeholder feedback, and adaptive planning throughout the project lifecycle. Agile Scrum was selected for its suitability to full-stack development projects requiring frequent integration testing, user feedback incorporation, and risk mitigation through incremental delivery.

**Sprint Structure and Ceremonies:** Development was organized into **2-week sprints**, each comprising sprint planning, daily standups (self-directed progress tracking), sprint reviews, and retrospectives. Sprint reviews and retrospectives were hosted by the project supervisor to evaluate feature completeness, provide technical guidance, and assess alignment with project objectives. This cadence enabled regular checkpoint validation while maintaining development momentum.

**Requirements Prioritization:** Requirements derived from Section 3.3 were prioritized using the MoSCoW framework, ensuring critical e-commerce and authentication functionality shipped first, followed by differentiating features (live streaming, AI chat, Skin Study), and optional enhancements (business management tools) in later sprints.

**Sprint Planning and Feature Allocation:** 

| Sprint | Duration | Focus Area | Requirements Covered | Deliverables |
|---|---|---|---|---|
| **Sprint 1** | Weeks 1–2 | Backend Foundation & Authentication | ADMIN_01, ADMIN_02 (partial), CUSTOMER_01 (partial) | RESTful API structure, PostgreSQL schema, JWT authentication, RBAC implementation, product catalog CRUD endpoints |
| **Sprint 2** | Weeks 3–4 | E-Commerce Core (Backend + Frontend) | CUSTOMER_01, CUSTOMER_02, CUSTOMER_03 | Shopping cart, checkout flow, order management endpoints, web customer UI for product browsing and purchasing |
| **Sprint 3** | Weeks 5–6 | Admin Dashboard & Business Management | ADMIN_01, ADMIN_02, ADMIN_03, ADMIN_06 | Web admin UI for product/order management, sales analytics dashboard, financial reporting module |
| **Sprint 4** | Weeks 7–8 | AI Chat & Personalization | CUSTOMER_04, ADMIN_09 (partial) | Google Gemini integration, conversational recommendation engine, FAQ management, staff escalation logic |
| **Sprint 5** | Weeks 9–10 | Live Streaming Infrastructure | CUSTOMER_05, CUSTOMER_06, ADMIN_05, ADMIN_08 | WebSocket server, real-time video streaming, product pinning, viewer analytics, web and mobile livestream viewing |
| **Sprint 6** | Weeks 11–12 | Skin Study Module (AI Dermatology) | CUSTOMER_08, ADMIN_07 | AI dermatology expert with text/voice chat, skin image analysis, RAG knowledge base integration with Qdrant, chat history management |
| **Sprint 7** | Weeks 13–14 | Mobile Applications (Customer & Admin) | CUSTOMER_05, CUSTOMER_06, ADMIN_05 | React Native customer app with Skin Study module, admin app for livestream management, cross-platform deployment (iOS/Android) |
| **Sprint 8** | Weeks 15–16 | Email Marketing & Advanced Features | ADMIN_04, CUSTOMER_10, CUSTOMER_07, CUSTOMER_09 | Email campaign management, customer segmentation, newsletter templates, real-time chat with staff, purchase history |
| **Sprint 9** | Weeks 17–18 | Testing, Documentation & Deployment | All requirements validation | UAT execution, Swagger API documentation finalization, deployment pipeline setup, performance optimization |
| **Sprint 10** | Weeks 19–20 | Polish & Contingency | ADMIN_10 (Could), final fixes | HR module (optional), bug fixes, UX refinements, final stakeholder demo preparation |

**Rationale for Sprint Allocation:** Sprint 1–2 established foundational infrastructure (authentication, database, API framework) required for all subsequent features. Sprint 3 delivered admin capabilities enabling supervisor review of business workflows. Sprint 4–6 implemented differentiating features (AI chat, livestreaming, Skin Study) validated through supervisor feedback. Sprint 7 extended platform reach via mobile applications. Sprint 8–9 completed secondary features and ensured production readiness. Sprint 10 provided buffer for polish and contingency.

**Risk Mitigation Through Agile:** Agile Scrum enabled early identification and resolution of technical risks. For example, Sprint 5 livestreaming implementation revealed WebSocket scalability challenges, addressed through architecture refinement before Sprint 7 mobile integration. Sprint 6 Skin Study RAG implementation required knowledge base curation, identified during sprint planning and mitigated through parallel documentation effort.

**Tools and Collaboration:** Version control via Git/GitHub enabled collaborative development and supervisor code review. API documentation via Swagger ensured contract-driven development between frontend and backend. Issue tracking and sprint planning via GitHub Projects maintained visibility into progress and blockers.

This Agile Scrum approach balanced structured planning with adaptive execution, ensuring systematic delivery of functional increments while incorporating continuous feedback from supervisor reviews and user validation sessions.

## 4.2 Project Plan & Timeline

## 4.3 Feasibility Analysis


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
