# 3. Requirements Analysis

## 3.1 Research Methodology

**Research Method (Table):**

| Item | Details |
|---|---|
| Approach | Mixed-methods (quantitative surveys + qualitative interviews) |
| Survey instrument | Google Forms (25 questions, distributed via beauty business communities and LinkedIn groups) |
| Responses & timeframe | 127 responses over 12 weeks |
| Demographics — Gender | 62% female, 38% male |
| Demographics — Age | 20–55 (mean 38.4) |
| Demographics — Business size | 1–50 employees (mean 8.3) |
| Demographics — Revenue | USD 100K–2M (median USD 450K) |
| Interviews | 6 in-depth interviews (45–60 minutes each): 2 subscription service founders, 2 independent skincare retailers, 2 luxury cosmetics managers |
| Sampling | Purposive selection representing diverse SME beauty business models |


## 3.2 Market Analysis and User Needs

**Analysis of Results:** 

#### Current Platform Usage & Costs
| Metric | Finding |
|---|---|
| Platform Fragmentation | 73% use 5+ platforms (M=6.8, SD=1.9)* |
| Monthly Software Costs | 81% report USD 500–3,000 |
| UI Satisfaction | 78% frustrated/very frustrated with existing UIs |

#### Feature Interest & Demand (Likert Scale 1-5)
| Feature | Interest Rate | Avg. Rating | Interpretation |
|---|---|---|---|
| AI Dermatological Consultation | 88% interested | M=4.2/5 | Strong demand; clinical credibility valued |
| AI Recommendations | 84% interested | M=4.3/5 | Highest-rated feature; core differentiator |
| Live Streaming Commerce | 76% interested | M=4.1/5 | Significant demand; real-time engagement critical |
| Unified Analytics Dashboard | 71% interested | M=3.9/5 | Moderate-to-strong demand; operational priority |
| Premium for Clinical Guidance | 71% willing to pay | M=3.9/5 | Customers value dermatological expertise |

*M = Mean (average); SD = Standard Deviation (measure of spread around the mean)

**Primary Frustrations (Table):**

| Category | Finding |
|---|---|
| Platform fragmentation | 35% report 3+ hours daily switching between systems (Shopify, Klaviyo, QuickBooks) |
| Limited personalization | 42% lack skin-type-based recommendations |
| No native streaming | 31% cite absence of live shopping capability |
| Lack of expert guidance | 56% report uncertainty about product suitability for their skin conditions |
| Migration propensity | 68% likely/very likely to migrate to an integrated alternative consolidating 5+ systems |

**Operational Requirements (Table):**

| Type | Item | Percentage |
|---|---|---|
| Priority | Consolidated inventory/orders | 94% |
| Priority | Real-time analytics/reporting | 88% |
| Priority | Customer segmentation | 82% |
| Priority | Employee access control | 76% |
| Priority | Financial reporting | 71% |
| Barrier | Setup complexity/training | 58% |
| Barrier | Data migration difficulty | 52% |

#### Data Interpretation & Strategic Implications

**Platform Fragmentation Crisis:** The survey revealed that 73% of SME beauty businesses use 5+ platforms (M=6.8, SD=1.9), with 35% reporting 3+ hours daily switching between systems. This quantitative data strongly supports our project's focus on **unified platform consolidation** as a core value proposition. The high standard deviation (SD=1.9) indicates significant variation in platform adoption—some businesses use 4-5 systems, others 8+—suggesting a one-size-fits-all integration approach is essential.

**Cost Burden & ROI Opportunity:** 81% of respondents report monthly software costs of USD 500–3,000 (median USD 1,250/month = USD 15K annually). This creates a compelling financial case: consolidating 5+ platforms into one integrated solution could reduce costs by 40–50% (USD 6K–7.5K annually per business), directly addressing Marcus Johnson's frustration with USD 2,100 monthly expenses. This cost savings is a primary migration driver: 68% are likely/very likely to switch to an integrated alternative.

**UI/UX as Competitive Differentiator:** 78% of respondents were frustrated or very frustrated with existing solutions' user interfaces. This quantitative data strongly supports our project's focus on a **streamlined, modern UX/UI design** as a key competitive advantage. Combined with 58% citing setup complexity/training as a barrier to adoption, the platform must prioritize intuitive onboarding and minimal learning curve.

**AI & Personalization as Market Demand:** Feature interest data reveals strong demand for AI-driven capabilities:
- **AI Dermatological Consultation (88%, M=4.2/5)**: Highest-priority AI feature; 71% willing to pay premium validates the clinical-grade guidance feature as a key market differentiator.
- **AI Recommendations (84%, M=4.3/5)**: Highest-rated feature overall; addresses "Limited personalization" frustration (42% lack skin-type recommendations)
- **Live Streaming Commerce (76%, M=4.1/5)**: Significant demand; 31% cite absence of native streaming as frustration

This data validates the platform's three core pillars: **integration, personalization, and engagement**.

**Operational Requirements Alignment:** Business operators prioritized consolidated inventory/orders (94%), real-time analytics (88%), and customer segmentation (82%). The 52% citing data migration difficulty as a barrier indicates the need for robust migration tools and support during onboarding.

**Detailed User Personas:**



---

## 3.3 Functional Requirements with MoSCoW Prioritisation

| ID | Description | Priority | Estimation |
|---|---|---|---|
| USR_01 | As a customer, I want to receive personalized product recommendations based on my skin type and concerns, so that I find products matching my specific needs without trial-and-error. | Must | 8 days |
| USR_02 | As a customer, I want to browse and search products with detailed ingredient lists and compatibility filters, so that I can make informed purchasing decisions aligned to my skin profile. | Must | 5 days |
| USR_03 | As a customer, I want to add products to cart, apply discounts, and complete checkout securely, so that I can purchase products with confidence. | Must | 8 days |
| USR_04 | As a customer, I want to track order status and receive notifications, so that I have visibility into delivery timelines. | Must | 5 days |
| USR_05 | As a customer, I want to watch live streaming commerce events with real-time product display and chat, so that I can interact with experts before purchasing. | Must | 8 days |
| USR_06 | As a customer, I want to chat with an AI assistant about product recommendations, ingredients, and usage, so that I receive expert guidance without waiting for staff. | Should | 8 days |
| USR_06A | As a customer, I want to consult with an AI dermatology expert about my skin concerns (acne, sensitivity, aging, hyperpigmentation), so that I receive clinical-grade guidance before purchasing. | Should | 10 days |
| USR_06B | As a customer, I want the AI dermatology expert to analyze my skin profile and recommend products from the catalog matched to dermatological best practices, so that I purchase with clinical confidence. | Should | 8 days |
| USR_07 | As a customer, I want to view my purchase history and reorder previous products, so that I can repurchase skincare routines efficiently. | Should | 3 days |
| USR_08 | As a customer, I want to write product reviews and view reviews from other customers, so that I can assess product quality through peer feedback. | Should | 5 days |
| USR_09 | As a customer, I want to receive email recommendations and exclusive offers matched to my profile, so that I discover relevant products. | Could | 3 days |
| USR_10 | As a customer, I want to create and save skincare routines, so that I can organize product recommendations into personalized regimens. | Could | 5 days |
| ADM_01 | As a business admin, I want to manage product catalog (create, edit, delete products with attributes), so that I maintain accurate inventory and product information. | Must | 5 days |
| ADM_02 | As a business admin, I want to view real-time sales analytics (revenue, orders, top products, conversion metrics), so that I monitor business performance and identify trends. | Must | 8 days |
| ADM_03 | As a business admin, I want to manage customer segmentation and email campaigns with audience filtering, so that I execute targeted marketing campaigns. | Should | 8 days |
| ADM_04 | As a business admin, I want to configure live streaming events (schedule, product pins, viewer analytics), so that I conduct organized live commerce sessions. | Should | 8 days |
| ADM_05 | As a business admin, I want to manage staff accounts with role-based access control (admin, staff, viewer), so that I protect sensitive data and restrict access appropriately. | Should | 5 days |
| ADM_06 | As a business admin, I want to view financial reports (revenue, expenses, cash flow, profitability by product), so that I monitor financial health and make data-driven decisions. | Should | 8 days |
| ADM_07 | As a business admin, I want to manage orders (view, update status, process refunds, export), so that I handle order fulfillment efficiently. | Should | 5 days |
| ADM_08 | As a business admin, I want to manage live streaming with real-time viewer engagement metrics and product pinning, so that I optimize live commerce performance. | Could | 8 days |
| ADM_09 | As a business admin, I want to configure AI chatbot responses and FAQ management, so that I customize customer support interactions. | Could | 5 days |
| ADM_09A | As a business admin, I want to configure the AI dermatology expert (knowledge base, skin concern categories, product-to-concern mappings), so that I ensure recommendations align with my brand and product catalog. | Should | 6 days |
| ADM_09B | As a business admin, I want to review and export dermatology consultation logs and customer skin profiles, so that I understand customer needs and optimize product offerings. | Should | 4 days |
| ADM_10 | As a business admin, I want to access employee HR records and document management, so that I centralize HR operations. | Could | 5 days |

### MoSCoW Summary

| Priority | Number of Features | Number of Days |
|---|---|---|
| Must | 5 | 26 |
| Should | 9 | 59 |
| Could | 3 | 15 |
| **TOTAL** | **17** | **100** |

---

## 3.4 Non-functional Requirements

| ID | Description |
|---|---|
| NF_01 | **Performance:** API endpoints respond within 500ms for 95% of requests under normal load (100 concurrent users). Database queries execute within 100ms for 90% of operations. |
| NF_02 | **Scalability:** Platform supports up to 1,000 concurrent users without performance degradation. Live streaming supports 500 concurrent viewers with <5 second latency. Horizontal scaling via containerized deployment (Docker/Kubernetes). |
| NF_03 | **Security:** All data transmitted via HTTPS/TLS encryption. Authentication via JWT tokens with 24-hour expiration. Passwords hashed using bcrypt (10 rounds minimum). Role-based access control (RBAC) enforcing least-privilege access. SQL injection and XSS prevention through parameterized queries and input validation. |
| NF_04 | **Data Protection & Compliance:** GDPR compliance with user consent management, data portability, and deletion capabilities. PCI DSS Level 1 compliance for payment data. User data encrypted at rest using AES-256 encryption. Regular security audits and penetration testing. |
| NF_05 | **Availability & Reliability:** Uptime SLA target: 99.5% (allowing ~3.6 hours downtime monthly). Automated database backups (daily, retained 30 days). Failover mechanisms for critical services. Error monitoring via centralized logging (e.g., Sentry). |
| NF_06 | **Usability:** Platform usable without training for users with basic computer literacy. WCAG 2.1 AA accessibility compliance (screen reader support, keyboard navigation). Interfaces responsive across desktop, tablet, mobile viewports (600px–2560px). Mobile app supports iOS 14+ and Android 10+. |
| NF_07 | **Internationalization & Localization:** Multi-language support (English, Spanish, French minimum). Currency conversion for international transactions. Timezone-aware scheduling and reporting. |
| NF_08 | **Maintainability & Documentation:** Code organized in modular architecture with clear separation of concerns. API documented via Swagger/OpenAPI specification. Database schema documented with ER diagrams. Deployment procedures documented with automated CI/CD pipelines. Code coverage minimum 70% for critical business logic. |
| NF_09 | **Browser & Device Support:** Web applications support Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Mobile applications support iOS 14+ and Android 10+. Graceful degradation for older browsers without core functionality loss. |
| NF_10 | **Real-time Communication:** WebSocket connections support live streaming with <5 second latency. Real-time chat updates within 2 seconds of message send. Automatic reconnection with exponential backoff for network interruptions. |
| NF_11 | **AI Dermatology Expert Accuracy & Safety:** AI dermatology responses include confidence scores and disclaimers (not a substitute for professional medical advice). Knowledge base trained on peer-reviewed dermatological literature and FDA-approved skincare guidelines. Response accuracy validated against dermatologist-reviewed test cases (minimum 95% accuracy on common skin concerns). Sensitive medical queries escalated to human support with clear handoff. |

---

