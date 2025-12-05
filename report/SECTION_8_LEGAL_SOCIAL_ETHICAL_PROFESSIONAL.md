# 8. Legal, Social, Ethical, and Professional Issues

## 8.1 Legal Compliance

This project complies with data protection legislation and software licensing requirements. The application processes authentication credentials, payment details, personal preferences, and health-related skincare information in accordance with GDPR, which mandates explicit user consent, data minimisation, and the right to erasure (European Union, 2016). User registration requires explicit consent, and the system maintains audit logs demonstrating lawful processing. All user data is stored in MongoDB Atlas with encryption at rest and in transit, ensuring confidentiality and integrity as required by GDPR Article 32. Role-based access control (RBAC) restricts data access to authorised personnel only, complying with the principle of least privilege. The application utilises third-party libraries with permissive open-source licenses, with all dependencies documented to ensure licensing compatibility. Payment processing adheres to PCI DSS requirements by delegating payment data handling to a certified third-party processor, ensuring sensitive payment card information is neither stored nor transmitted directly by the application.

## 8.2 Ethical Data Handling

The application implements ethical data management through explicit consent and secure storage. Users receive a clear privacy notice before account creation, explaining data collection, usage, and access in accordance with informed consent guidelines (Stark and Hoey, 2021). Only data required for core functionality is retained, adhering to data minimisation principles. Sensitive health information from skin analysis consultations is processed through Google Generative AI with explicit consent and is not permanently stored without user request. Payment information is processed through VNPay, a PCI DSS-compliant gateway, and is not stored on application servers. User passwords are hashed using bcryptjs with a salt factor of 10, preventing plaintext storage (Provos and Mazières, 2019). RBAC ensures only authorised personnel access sensitive operations. File uploads are secured through Multer middleware with file type validation and size restrictions. Users can request data deletion through a dedicated endpoint, supporting autonomy and control. Input validation via express-validator sanitises user inputs, preventing injection attacks and ensuring data integrity.

## 8.3 Social Impact

The project provides an accessible beauty and skincare platform with multilingual support via Vue-i18n, reducing language barriers to e-commerce participation (Graddol, 2010). The livestream shopping feature, powered by Agora SDK, enables direct seller-customer engagement, fostering community and trust. The AI dermatology expert feature democratises skincare advice through personalised recommendations based on skin analysis, potentially improving health outcomes for users lacking access to professional consultation. Multi-platform availability (web, iOS, Android) ensures broad accessibility across devices and demographics. However, critical considerations arise regarding the platform's focus on beauty products, which may inadvertently reinforce societal beauty standards and affect user self-perception (Tiggemann and Slater, 2013). Mitigation strategies could include educational content promoting diverse beauty standards and skincare inclusivity. The platform's ethical integrity depends on fair pricing and ethical sourcing by sellers, which is not currently enforced through automated verification. Future iterations should leverage OCR capabilities via Tesseract.js for product authenticity verification and incorporate seller verification mechanisms to prevent counterfeit or harmful products, protecting vulnerable consumers and promoting safety.

## 8.4 Professional Standards

The development process adhered to professional software engineering standards, ensuring code quality, maintainability, and reliability. The codebase implements modular architecture with separation of concerns—controllers handle HTTP requests, services encapsulate business logic, and models define data structures—aligning with industry best practices (Martin, 2017). The project applies domain-driven design with distinct service modules, enabling independent scaling and team collaboration. Version control was maintained using Git with GitHub and meaningful commit messages for traceability. Comprehensive testing across unit, integration, and user acceptance phases demonstrates commitment to quality assurance. API documentation is auto-generated using Swagger/OpenAPI standards, specifying endpoint behaviour, schemas, and authentication requirements. Error handling is consistent throughout, with appropriate HTTP status codes and descriptive messages. Security best practices include input validation via express-validator, parameterised queries preventing SQL injection, rate limiting via express-rate-limit, and JWT-based authentication. Environment-based configuration via dotenv separates credentials from source code, preventing accidental exposure. Performance monitoring tracks API response times and database query performance. The application is containerised using Docker for consistent deployment across environments, following infrastructure-as-code principles. These practices collectively ensure the application meets industry standards for reliability, security, maintainability, and scalability.

## References

European Union (2016) 'Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data', *Official Journal of the European Union*, 119, pp. 1–88.

Graddol, D. (2010) *English next India: The rising demand for English in India*. London: British Council.

Martin, R. C. (2017) *Clean architecture: A craftsman's guide to software structure and design*. Boston: Prentice Hall.

Payment Card Industry Security Standards Council (2018) *PCI Data Security Standard Version 3.2.1: Requirements and Security Assessment Procedures*. Wayne, PA: PCI Security Standards Council.

Provos, N. and Mazières, D. (2019) 'A future-adaptable password scheme', in *Proceedings of the USENIX Annual Technical Conference*. Berkeley: USENIX Association.

Stark, L. and Hoey, J. (2021) 'The ethics of emotion in artificial intelligence systems', in *Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency*, pp. 782–793.

Tiggemann, M. and Slater, A. (2013) 'NetGirls: The internet, Facebook, and body image concern in adolescent girls', *Journal of Early Adolescence*, 33(5), pp. 541–564.

