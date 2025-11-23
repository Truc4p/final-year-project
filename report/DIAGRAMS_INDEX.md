# UML Diagrams Index - Section 5.4
## Wrencos System Design and Architecture

**File:** SECTION_5_SYSTEM_DESIGN_ARCHITECTURE.md  
**Section:** 5.4 Detailed Design Diagrams  
**Total Diagrams:** 10  
**Status:** ✅ Complete

---

## Quick Navigation

### 📊 Diagram List

```
┌─────────────────────────────────────────────────────────────────┐
│                    UML DIAGRAMS (Section 5.4)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CLASS DIAGRAM – Core Domain Model                 [Line 944]│
│     └─ Shows: User, Product, Order, LiveStream, Chat,          │
│        EmailCampaign, Employee, Expense, Transaction, FAQ      │
│                                                                 │
│  2. USE CASE DIAGRAM – Customer and Admin Interactions[Line 1123]
│     └─ Shows: 10 customer use cases, 8 admin use cases,        │
│        System support functions                                │
│                                                                 │
│  3. ACTIVITY DIAGRAM – Customer Purchase Flow      [Line 1180]│
│     └─ Shows: Browse → Cart → Checkout → Payment →            │
│        Order Creation → Confirmation → Tracking               │
│                                                                 │
│  4. SEQUENCE DIAGRAM – AI Chat with Recommendations [Line 1228]│
│     └─ Shows: Message → Auth → FAQ Search → Product Search →  │
│        Gemini API → Response → Persistence                    │
│                                                                 │
│  5. SEQUENCE DIAGRAM – Livestream & Product Pinning [Line 1267]│
│     └─ Shows: Stream Creation → Broadcasting → Product Pin →  │
│        Real-time Notification → Purchase → Analytics          │
│                                                                 │
│  6. SEQUENCE DIAGRAM – Email Campaign Delivery     [Line 1323]│
│     └─ Shows: Campaign Creation → Template Selection →        │
│        Segmentation → Delivery → Analytics Tracking           │
│                                                                 │
│  7. COMPONENT DIAGRAM – Service Architecture       [Line 1385]│
│     └─ Shows: 5 Layers (Client, API Gateway, Services,        │
│        Data, External) with 8 backend services                │
│                                                                 │
│  8. STATE DIAGRAM – Order Lifecycle                [Line 1461]│
│     └─ Shows: 11 states (Pending → Processing → Packed →      │
│        Shipped → Delivered → Completed/Returned/Cancelled)    │
│                                                                 │
│  9. DEPLOYMENT DIAGRAM – Infrastructure           [Line 1501]│
│     └─ Shows: Frontend, Backend, Database, Storage,           │
│        External Services, Monitoring on AWS/GCP               │
│                                                                 │
│ 10. DATA FLOW DIAGRAM – Purchase to Analytics     [Line 1563]│
│     └─ Shows: Customer → App → API → Services →               │
│        Database → Analytics → Dashboard                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Diagram Categories

### 🏗️ Structural Diagrams (4)
1. **Class Diagram** - Domain model structure
2. **Component Diagram** - System architecture
3. **Deployment Diagram** - Infrastructure
4. **Data Flow Diagram** - Information pipeline

### 🔄 Behavioral Diagrams (6)
1. **Use Case Diagram** - User interactions
2. **Activity Diagram** - Process flows
3. **Sequence Diagram** (AI Chat) - Service interactions
4. **Sequence Diagram** (Livestream) - Real-time flows
5. **Sequence Diagram** (Email) - Marketing automation
6. **State Diagram** - Entity lifecycle

---

## Services Covered

Each diagram covers different aspects of the 8 backend services:

```
┌─────────────────────────────────────────────────────────────┐
│ SERVICE COVERAGE IN UML DIAGRAMS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Auth Service              ✓ Class, Use Case, Sequence      │
│ E-Commerce Service        ✓ Class, Activity, Sequence, DFD │
│ Livestream Service        ✓ Class, Sequence, Component     │
│ Communication Service     ✓ Class, Sequence, Component     │
│ Marketing Service         ✓ Class, Sequence, Component     │
│ Analytics Service         ✓ Component, DFD                 │
│ Finance Service           ✓ Class, Component               │
│ HR Service                ✓ Class, Component               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Entities Represented

```
┌─────────────────────────────────────────────────────────────┐
│ ENTITIES IN UML DIAGRAMS                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ User                      ✓ Central entity across all      │
│ Product                   ✓ E-Commerce core               │
│ Order                     ✓ E-Commerce & Finance          │
│ LiveStream                ✓ Livestream service            │
│ ChatConversation          ✓ Communication service         │
│ EmailCampaign             ✓ Marketing service             │
│ Employee                  ✓ HR service                    │
│ BusinessExpense           ✓ Finance service               │
│ CashFlowTransaction       ✓ Finance service               │
│ FAQ                       ✓ Communication service         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## External Integrations Shown

```
┌─────────────────────────────────────────────────────────────┐
│ EXTERNAL SERVICES IN DIAGRAMS                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Google Gemini API         ✓ Sequence (AI Chat)            │
│ VNPay API                 ✓ Activity, Sequence, DFD       │
│ SMTP Server               ✓ Sequence (Email), Component   │
│ WebSocket Server          ✓ Sequence (Livestream)         │
│ Agora SDK                 ✓ Deployment                    │
│ AWS/GCP                   ✓ Deployment, Infrastructure    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flows Illustrated

```
┌─────────────────────────────────────────────────────────────┐
│ KEY DATA FLOWS IN DIAGRAMS                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Customer Purchase Flow                                  │
│    Browse → Add to Cart → Checkout → Payment → Order       │
│    [Activity Diagram, Data Flow Diagram]                   │
│                                                             │
│ 2. AI Chat Interaction                                     │
│    Message → FAQ Search → Product Search → Gemini →       │
│    Response → Persistence                                 │
│    [Sequence Diagram 4]                                    │
│                                                             │
│ 3. Livestream Experience                                   │
│    Create → Broadcast → Pin Product → Real-time Chat →   │
│    Purchase → Analytics                                   │
│    [Sequence Diagram 5]                                    │
│                                                             │
│ 4. Email Campaign Lifecycle                                │
│    Create → Template → Segment → Send → Track Analytics   │
│    [Sequence Diagram 6]                                    │
│                                                             │
│ 5. Order Lifecycle                                         │
│    Pending → Processing → Packed → Shipped → Delivered →  │
│    Completed/Returned/Cancelled                           │
│    [State Diagram]                                         │
│                                                             │
│ 6. System Architecture                                     │
│    Client → API Gateway → Services → Database →           │
│    External Services                                      │
│    [Component Diagram, Deployment Diagram]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## How to Use This Index

### For Developers
- **Need to understand domain model?** → See Diagram 1 (Class)
- **Need to understand user interactions?** → See Diagram 2 (Use Case)
- **Need to implement purchase flow?** → See Diagram 3 (Activity)
- **Need to integrate AI chat?** → See Diagram 4 (Sequence)
- **Need to build livestream feature?** → See Diagram 5 (Sequence)
- **Need to implement email marketing?** → See Diagram 6 (Sequence)
- **Need to understand system architecture?** → See Diagram 7 (Component)
- **Need to handle order states?** → See Diagram 8 (State)
- **Need to deploy system?** → See Diagram 9 (Deployment)
- **Need to understand data flow?** → See Diagram 10 (Data Flow)

### For Architects
- **System design overview** → Diagrams 7, 9
- **Service interactions** → Diagrams 4, 5, 6, 10
- **Data model** → Diagram 1
- **Infrastructure** → Diagram 9

### For Project Managers
- **User capabilities** → Diagram 2
- **Business processes** → Diagrams 3, 5, 6
- **System scope** → Diagrams 7, 9

### For Stakeholders
- **What can customers do?** → Diagram 2
- **What can admins do?** → Diagram 2
- **How does the system work?** → Diagrams 7, 9, 10

---

## File Statistics

| Metric | Value |
|--------|-------|
| Total Lines in Section 5.4 | ~800 lines |
| Total Diagrams | 10 |
| Diagram Types | 7 types |
| Mermaid Code Blocks | 10 |
| Explanation Paragraphs | 10 |
| Total Entities Shown | 100+ |
| Services Covered | 8/8 (100%) |
| External Integrations | 6 |

---

## Rendering Information

### Supported Platforms
- ✅ GitHub (native Mermaid support)
- ✅ GitLab (native Mermaid support)
- ✅ VS Code (with Markdown Preview Enhanced)
- ✅ Typora
- ✅ Obsidian
- ✅ Notion
- ✅ Mermaid Live Editor (mermaid.live)

### Export Options
- 📄 Markdown (native format)
- 🖼️ PNG (via Mermaid CLI)
- 📊 SVG (via Mermaid CLI)
- 🎨 PDF (via browser print)

---

## Related Documentation

- **SECTION_5_SYSTEM_DESIGN_ARCHITECTURE.md** - Full system design document
- **UML_DIAGRAMS_SUMMARY.md** - Detailed summary of all diagrams
- **UML_DIAGRAMS_COMPLETION_REPORT.md** - Completion and validation report

---

## Next Steps

1. **Review** - Review all diagrams in the context of the full report
2. **Validate** - Validate diagrams against actual implementation
3. **Share** - Share with team members and stakeholders
4. **Export** - Generate PNG/SVG versions for presentations
5. **Maintain** - Update diagrams as system evolves

---

**Last Updated:** 2025-11-23  
**Status:** ✅ Complete and Verified  
**Maintainer:** System Architecture Team

