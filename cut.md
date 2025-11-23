rep

### Persona B2 — Marcus Johnson (Male, 42)
- Role: Founder, Subscription Skincare Startup
- Image: [Stock photo placeholder — search keywords: "male tech founder 40s office"]
- Bio: Marcus runs a DTC (Direct to Consumer) subscription brand with ~5,000 active subscribers and a lean team of 6. He tracks CAC/LTV (Lifetime Value to Customer Acquisition Cost Ratio), churn, and cohorts in spreadsheets. He’s comfortable with APIs but doesn’t have a full data team and needs pragmatic automation.
- Goals:
  - Reduce churn with personalized AI routines and timely nudges.
  - Centralize analytics for cohort/retention without stitching five exports.
  - Standardize live events for launches and education, with conversion tracking.
  - Implement access control and audit logs as the team scales.
- Frustrations:
  - Siloed data and unreliable attribution; manual reporting every week.
  - Migrating data is risky and time-consuming; previous attempts caused outages.
  - Fragile streaming overlays and no unified measurement of event ROI.
- Motivations:
  - Investor readiness and operational excellence; wants crisp dashboards and predictable growth levers.
  - Reducing tool bloat while maintaining security/compliance.
- Key platform features he’ll use:
  - Unified analytics/dashboarding (ADM_02) and financial reporting (ADM_06)
  - AI recommendations + dermatologist-aligned guidance (USR_01, USR_06A/06B)
  - Customer segmentation and lifecycle campaigns (ADM_03)
  - Live streaming commerce with product pins + viewer analytics (USR_05, ADM_04/ADM_08)
  - Data migration assistance + tooling (Operational Barriers → addressed)
  - RBAC (Role-Based Access Control)/least-privilege access (ADM_05) and auditability (Security NFRs)


In the early 2000s, e-commerce focused on internal logistics, making sure the system works, tracking inventory, and processing orders

Nowadays, e-commerce focuses on external customer service, using data to create unique, tailored shopping experiences and personalized recommendations for every single user

E-commerce has evolved from early inventory-focused systems toward customer experience personalization (Turban et al., 2015). 

Turban, E., King, D., Lee, J. K., Liang, T. P., & Turban, D. C. (2015). Electronic commerce: A managerial and social networks perspective (8th ed.). New York: Springer.

Within dermatology, recent advances demonstrate that deep learning models can reach clinician-level performance for image-based diagnosis (Esteva et al., 2017) and differential classification (Liu et al., 2020). Large, publicly available dermatoscopic datasets such as HAM10000 enable robust evaluation and benchmarking (Tschandl, Rosendahl and Kittler, 2018), while recent studies highlight fairness and generalisation concerns across diverse real-world populations that must be addressed in deployment (Daneshjou et al., 2022).



**Scope (Features Included):** This project encompasses comprehensive e-commerce functionality including product catalogs, shopping cart, payment, order management, and inventory control. Live streaming capabilities include video streaming, real-time chat functionality, product pinning during streams, and viewer analytics. AI-powered chat integration provides personalized product recommendations based on customer skin type and concerns, alongside FAQ management with staff escalation. Email marketing systems support campaign management and customer segmentation functionality. Analytics dashboards enable business performance monitoring and reporting. Financial management modules facilitate cash flow tracking and expense recording. Human resources modules support employee record management and documentation. AI dermatology expert with text and voice chat, skin image analysis, RAG-based knowledge base with curated dermatology literature, chat history management, multi-language support, real-time audio streaming. Multi-platform support extends across web-based administrative interfaces, web-based customer interfaces, and cross-platform mobile applications for iOS and Android platforms. Web browser compatibility includes Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Mobile support targets iOS 14+ and Android 10+.

**Limitations (Features Excluded):** The project explicitly excludes advanced payment gateway integration beyond basic structural implementation, complex logistics integration with third-party fulfillment providers, augmented reality virtual try-on functionality, social commerce features, advanced marketing automation beyond email segmentation, enterprise multi-tenancy capabilities, video processing effects, and subscription business models. These exclusions reflect realistic constraints on development capacity and project scope within the defined 10-month timeline while ensuring core functionality achieves quality standards.

pro
In-scope: complete e-commerce (product catalog, shopping cart, orders, inventory, categories), live streaming (WebSocket-based video streaming infrastructure, real-time chat, product pinning, viewer analytics), AI chat (Google Gemini integration, conversational product recommendations, FAQ management with staff escalation), Skin Study feature (AI dermatology expert with text and voice chat, skin image analysis, RAG-based knowledge base with curated dermatology literature, chat history management, multi-language support, real-time audio streaming), email marketing (campaigns, customer segmentation, email templates, newsletter management, audience targeting), analytics dashboards (sales metrics, customer insights, product performance), financial management (cash flow tracking, expense recording, financial reporting, profit analysis), HR module (employee records, document management), authentication (JWT tokens, role-based access control with admin/customer roles), API documentation (Swagger/OpenAPI), and multi-platform support (Vue.js web admin, Vue.js web customer, React Native iOS/Android mobile customer app with integrated Skin Study, React Native iOS/Android mobile admin app for livestream management). Web browser compatibility includes Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Mobile support targets iOS 14+ and Android 10+.
