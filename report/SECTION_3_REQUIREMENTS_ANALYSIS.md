# 3. Requirements Analysis

## 3.1 Research Methodology

**Research Method:** A mixed-methods approach combined quantitative surveys and qualitative interviews. An online Google Forms survey with 25 questions was distributed across beauty business communities and LinkedIn groups, accumulating 127 responses over 12 weeks. Respondents: 62% female, 38% male; age 25–55 (mean 38.4); business size 1–50 employees (mean 8.3); revenue USD 100K–2M (median USD 450K). Six in-depth interviews (45–60 minutes each) with beauty business owners—2 subscription service founders, 2 independent skincare retailers, 2 luxury cosmetics managers—explored workflows, technology satisfaction, and priorities. Interview participants were purposively selected to represent diverse business models within SME beauty market.

## 3.2 Market Analysis and User Needs

**Analysis of Results:** Survey findings confirmed market demand for integrated solutions. Key metrics: 73% use 5+ platforms (M=6.8, SD=1.9); 81% report monthly software costs USD 500–3,000; 78% frustrated/very frustrated with platform UIs. Feature interest: 89% want AI recommendations (M=4.3/5), 76% want live streaming (M=4.1/5), 71% want unified analytics (M=3.9/5). This quantitative data strongly supports SME demand for integrated e-commerce, AI personalization, and real-time engagement.

**Primary Frustrations:** (1) Platform fragmentation—35% report 3+ hours daily switching between systems (Shopify, Klaviyo, QuickBooks); (2) Limited personalization—42% lack skin-type-based recommendations; (3) No native streaming—31% cite absence of live shopping capability. Response: 68% likely/very likely to migrate to integrated alternative consolidating 5+ systems.

**Operational Requirements:** Business operators prioritized: (1) Consolidated inventory/orders (94%); (2) Real-time analytics/reporting (88%); (3) Customer segmentation (82%); (4) Employee access control (76%); (5) Financial reporting (71%). Barriers: 58% cited setup complexity/training; 52% cited data migration difficulty.

**Detailed User Personas:**

### Customer Persona: Sarah Chen – The Conscious Beauty Consumer

**Bio:** Marketing manager, 32, San Francisco. USD 110K annual income. Prioritizes skincare; researches ingredients carefully; follows skincare influencers. Combination skin with occasional sensitivity. Shops online due to schedule but skeptical from past mismatches (color, reactions).

**Goals:** Purchase skincare matching skin type without trial-and-error. Personalized recommendations for sensitivity/breakouts/hydration needs. Real-time expert guidance during live shopping. Complete research/purchase in <15 minutes.

**Frustrations:** Generic recommendations ignoring skin concerns. Complicated returns. Manual ingredient research across listings. Lack of authentic product demonstrations; static photos insufficient for trust-based beauty purchases.

**Motivations:** Personalized guidance aligned to specific needs. Authentic expert commentary during live demos building confidence. Time-savings and streamlined experience. Social proof from customers with similar skin types.

### Business Persona: Marcus Johnson – The Independent Skincare Retailer

**Bio:** Founded natural skincare brand 7 years ago; USD 780K annual revenue. 4-person team. Operates Shopify e-commerce, physical Brooklyn location, Instagram sales. Technically proficient but prefers user-friendly platforms.

**Goals:** Consolidate 5 fragmented platforms (e-commerce, email, inventory, accounting, analytics). Increase AOV/LTV through personalized recommendations. Test live streaming commerce. Clear financial reporting (cash flow, profitability, ROI). Scale support via AI chatbot with staff escalation.

**Frustrations:** USD 2,100 monthly software costs. Data silos prevent customer analysis (Shopify/Klaviyo unintegrated). Staff training overhead for multiple interfaces. Inventory management complexity (stockouts/overselling). Lacks resources for personalization implementation.

**Motivations:** Cost reduction—consolidation could save 40–50%. Competitive advantage via personalization/live engagement. Data-driven decision-making. Scalability without proportional cost increase. ROI-measurable investments.

### Operations Persona: David Park – The Beauty Brand Operations Manager

**Bio:** Operations Manager, Elena Beauty, USD 2.3M revenue. Oversees 12 staff (marketing, customer service, inventory, social). Reports to CEO. Business degree with BI coursework. Experienced operations/data analysis, not deeply technical.

**Goals:** Real-time dashboards (sales, inventory, CAC, profitability). Role-based access control protecting sensitive data. Streamlined staff onboarding/training. Consolidate business functions (HR, finance, analytics). Reduce administrative overhead via automation.

**Frustrations:** Weekly admin work integrating data across systems for reporting (export Shopify/Mailchimp/QuickBooks/Analytics, consolidate in Excel). Staff training burden learning multiple interfaces. No visibility into campaign performance vs. sales (data silos). Access control risks enabling data exposure.

**Motivations:** Operational visibility and data-driven decisions. Time-savings focusing on strategy vs. admin. Compliance/risk management via centralized access control. Staff productivity via simplified workflows. Growth scalability (USD 2.3M→5M+ without staff proportional increase).

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
| ADM_10 | As a business admin, I want to access employee HR records and document management, so that I centralize HR operations. | Could | 5 days |

### MoSCoW Summary

| Priority | Number of Features | Number of Days |
|---|---|---|
| Must | 5 | 26 |
| Should | 7 | 41 |
| Could | 3 | 15 |
| **TOTAL** | **15** | **82** |

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

---

