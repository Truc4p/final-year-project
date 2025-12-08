# Vector Service Architecture Diagrams

## 1. Overall System Architecture

```mermaid
flowchart TB
    subgraph "External Services"
        Gemini[Google Gemini API<br/>text-embedding-004]
        Qdrant[Qdrant Vector DB<br/>localhost:6333]
        Secrets[Secret Manager<br/>API Keys & URLs]
    end
    
    subgraph "Vector Service"
        VS[VectorService Class]
        Init[initialize<br/>Setup clients]
        Setup[setup<br/>One-time indexing]
        Query[ragQuery<br/>Runtime search]
        Search[searchRelevantDocs<br/>Vector search]
    end
    
    subgraph "Knowledge Base"
        TXT[Text Files<br/>*.txt]
        Chunks[Document Chunks<br/>1500 chars each]
        Vectors[768-D Vectors<br/>Embeddings]
    end
    
    subgraph "Application"
        API[API Routes]
        Controller[Controllers]
        User[User Query]
    end
    
    Secrets --> Init
    Init --> Gemini
    Init --> Qdrant
    
    TXT --> Setup
    Setup --> Chunks
    Chunks --> Gemini
    Gemini --> Vectors
    Vectors --> Qdrant
    
    User --> API
    API --> Controller
    Controller --> Query
    Query --> Search
    Search --> Qdrant
    Search --> Gemini
    Search --> Controller
    
    style VS fill:#4CAF50
    style Gemini fill:#FF9800
    style Qdrant fill:#2196F3
    style User fill:#9C27B0
```

## 2. One-Time Setup Flow

```mermaid
sequenceDiagram
    participant Script as Setup Script
    participant VS as VectorService
    participant FS as File System
    participant Splitter as TextSplitter
    participant Gemini as Gemini API
    participant Qdrant as Qdrant DB
    
    Script->>VS: setup()
    activate VS
    
    VS->>Qdrant: initializeCollection()
    Qdrant-->>VS: Collection 'dermatology_knowledge' created
    
    VS->>FS: loadKnowledgeBase()
    activate FS
    FS-->>VS: Read *.txt files
    deactivate FS
    
    loop For each text file
        VS->>Splitter: splitText(content)
        Splitter-->>VS: chunks[] (1500 chars, 300 overlap)
    end
    
    VS->>VS: Create documents with metadata
    
    VS->>VS: indexDocuments(documents)
    activate VS
    
    loop Batches of 50 documents
        VS->>Gemini: embedDocuments(texts)
        Gemini-->>VS: 768-D vectors[]
        
        VS->>VS: Validate embeddings
        
        VS->>Qdrant: upsert(points)
        Qdrant-->>VS: Indexed successfully
        
        Note over VS: Wait 100ms between batches
    end
    
    deactivate VS
    VS-->>Script: Setup complete
    deactivate VS
```

## 3. RAG Query Pipeline (Runtime)

```mermaid
flowchart LR
    subgraph "1. User Input"
        Q[User Query:<br/>'What is acne?']
    end
    
    subgraph "2. Query Embedding"
        QE[Convert to Vector<br/>768 dimensions]
        Gemini1[Gemini API<br/>embedQuery]
    end
    
    subgraph "3. Vector Search"
        VS[Cosine Similarity<br/>Search]
        Filter[Filter > 0.4<br/>threshold]
        Top[Top 3 Chunks]
    end
    
    subgraph "4. Context Building"
        Chunks[Retrieved Chunks<br/>with metadata]
        Context[Formatted Context<br/>with sources]
    end
    
    subgraph "5. AI Response"
        Gemini2[Gemini Chat<br/>with context]
        Answer[Grounded Answer<br/>+ citations]
    end
    
    Q --> QE
    QE --> Gemini1
    Gemini1 --> VS
    VS --> Filter
    Filter --> Top
    Top --> Chunks
    Chunks --> Context
    Context --> Gemini2
    Gemini2 --> Answer
    
    style Q fill:#E1F5FE
    style Answer fill:#C8E6C9
    style VS fill:#FFF9C4
```

## 4. Detailed RAG Query Sequence

```mermaid
sequenceDiagram
    participant User
    participant Controller
    participant VS as VectorService
    participant PM as PerformanceMonitor
    participant Gemini as Gemini API
    participant Qdrant as Qdrant DB
    
    User->>Controller: "What causes acne?"
    Controller->>VS: ragQuery(userQuery)
    activate VS
    
    VS->>PM: startTimer()
    
    rect rgb(255, 248, 220)
        Note over VS,Qdrant: RETRIEVAL PHASE
        VS->>VS: ensureInitialized()
        VS->>Gemini: embedQuery(query)
        Gemini-->>VS: queryVector[768]
        
        VS->>Qdrant: search(vector, limit=3)
        Note over Qdrant: Cosine similarity search<br/>score_threshold=0.4
        Qdrant-->>VS: results with scores
    end
    
    rect rgb(232, 245, 233)
        Note over VS: ANALYSIS PHASE
        VS->>VS: Calculate statistics<br/>(avg, max, min scores)
        VS->>VS: Analyze matched keywords
        VS->>VS: Categorize relevance
    end
    
    rect rgb(227, 242, 253)
        Note over VS: CONTEXT BUILDING
        VS->>VS: Format context with sources
        VS->>PM: record metrics
    end
    
    VS-->>Controller: {context, sources}
    deactivate VS
    
    Controller->>Gemini: Generate response<br/>with context
    Gemini-->>Controller: Grounded answer
    Controller-->>User: Response + sources
```

## 5. Document Indexing Process

```mermaid
flowchart TD
    Start([Start Indexing]) --> ReadFiles[Read .txt files from<br/>knowledge-sources/]
    
    ReadFiles --> Filter{Filter<br/>.txt files?}
    Filter -->|Yes| Process[Process each file]
    Filter -->|No| Error1[Error: No files]
    
    Process --> Split[Split into chunks<br/>RecursiveCharacterTextSplitter]
    
    Split --> Config["Chunk Config:<br/>size=1500 chars<br/>overlap=300 chars<br/>separators=newlines, periods, spaces"]
    
    Config --> AddMeta[Add metadata:<br/>- source file<br/>- chunk index<br/>- file chunk index]
    
    AddMeta --> Batch{Create batches<br/>of 50 docs}
    
    Batch --> Loop[For each batch]
    
    Loop --> GenEmbed[Generate embeddings<br/>via Gemini API]
    
    GenEmbed --> Validate{Validate<br/>embeddings?}
    Validate -->|Valid| CreatePoints[Create Qdrant points:<br/>ID + Vector + Payload]
    Validate -->|Invalid| Retry{Retries<br/>< 3?}
    
    Retry -->|Yes| GenEmbed
    Retry -->|No| Skip[Skip batch<br/>Log failure]
    
    CreatePoints --> Upload[Upload to Qdrant<br/>upsert operation]
    
    Upload --> Wait[Wait 100ms]
    
    Wait --> MoreBatches{More<br/>batches?}
    MoreBatches -->|Yes| Loop
    MoreBatches -->|No| Summary[Print summary:<br/>Success/Failed counts]
    
    Skip --> MoreBatches
    
    Summary --> End([Indexing Complete])
    
    style Start fill:#4CAF50
    style End fill:#4CAF50
    style Error1 fill:#F44336
    style Skip fill:#FF9800
    style Validate fill:#FFC107
```

## 6. Vector Similarity Search Explained

```mermaid
graph TB
    subgraph "Query Processing"
        Q[User Query:<br/>'acne treatment']
        QV[Query Vector<br/>768 dimensions]
    end
    
    subgraph "Vector Database (Qdrant)"
        C1[Chunk 1 Vector<br/>Score: 0.87<br/>'Acne vulgaris treatment...']
        C2[Chunk 2 Vector<br/>Score: 0.76<br/>'Topical medications for acne...']
        C3[Chunk 3 Vector<br/>Score: 0.62<br/>'Inflammatory skin conditions...']
        C4[Chunk 4 Vector<br/>Score: 0.38<br/>FILTERED OUT]
        C5[Chunk 5 Vector<br/>Score: 0.21<br/>FILTERED OUT]
    end
    
    subgraph "Similarity Calculation"
        CS["Cosine Similarity<br/>cos(θ) = A·B / (|A| × |B|)"]
        Range[Range: 0.0 to 1.0<br/>1.0 = identical meaning<br/>0.0 = unrelated]
    end
    
    subgraph "Results"
        Top3[Top 3 Results<br/>Score ≥ 0.4]
        R1[🟢 EXCELLENT 0.87]
        R2[🟢 EXCELLENT 0.76]
        R3[🟡 GOOD 0.62]
    end
    
    Q --> QV
    QV --> CS
    CS --> C1
    CS --> C2
    CS --> C3
    CS --> C4
    CS --> C5
    
    C1 --> R1
    C2 --> R2
    C3 --> R3
    
    R1 --> Top3
    R2 --> Top3
    R3 --> Top3
    
    style Q fill:#E1F5FE
    style R1 fill:#C8E6C9
    style R2 fill:#C8E6C9
    style R3 fill:#FFF9C4
    style C4 fill:#FFCDD2
    style C5 fill:#FFCDD2
```

## 7. Class Structure and Methods

```mermaid
classDiagram
    class VectorService {
        -QdrantClient qdrantClient
        -GoogleGenerativeAIEmbeddings embeddings
        -boolean isInitialized
        -number vectorSize = 768
        -string collectionName = 'dermatology_knowledge'
        
        +initialize() Promise
        +ensureInitialized() Promise
        +initializeCollection() Promise
        +loadKnowledgeBase() Promise~Document[]~
        +indexDocuments(documents) Promise
        +searchRelevantDocs(query, limit, debugMode) Promise~Result[]~
        +ragQuery(userQuery, history, debugMode) Promise~Object~
        +scoreCategory(score) string
        +setup() Promise
        +getStats() Promise~Stats~
        +deleteCollection() Promise~boolean~
        +reset() Promise
    }
    
    class QdrantClient {
        +getCollections()
        +createCollection()
        +upsert()
        +search()
        +deleteCollection()
    }
    
    class GoogleGenerativeAIEmbeddings {
        +embedQuery(text) Promise~number[]~
        +embedDocuments(texts) Promise~number[][]~
    }
    
    class RecursiveCharacterTextSplitter {
        +splitText(content) Promise~string[]~
    }
    
    class PerformanceMonitor {
        +startTimer() number
        +endTimer(startTime) number
        +record(metric, value)
    }
    
    class SecretManager {
        +getSecret(key) Promise~string~
    }
    
    VectorService --> QdrantClient : uses
    VectorService --> GoogleGenerativeAIEmbeddings : uses
    VectorService --> RecursiveCharacterTextSplitter : uses
    VectorService --> PerformanceMonitor : uses
    VectorService --> SecretManager : uses
```

## 8. Data Flow - Setup vs Runtime

```mermaid
graph LR
    subgraph "SETUP (One-time)"
        direction TB
        SF[Source Files<br/>dermatology.txt] --> SC[Split into Chunks<br/>1500 chars]
        SC --> SE[Generate Embeddings<br/>Gemini API]
        SE --> SD[Store in Qdrant<br/>Vector Database]
        
        style SF fill:#E3F2FD
        style SC fill:#E3F2FD
        style SE fill:#E3F2FD
        style SD fill:#E3F2FD
    end
    
    subgraph "RUNTIME (Per query)"
        direction TB
        UQ[User Query<br/>'What is eczema?'] --> QE[Query Embedding<br/>Gemini API]
        QE --> VS[Vector Search<br/>Qdrant]
        VS --> RC[Retrieve Chunks<br/>Top 3 results]
        RC --> BC[Build Context<br/>with sources]
        BC --> GR[Generate Response<br/>Gemini Chat]
        
        style UQ fill:#FFF3E0
        style QE fill:#FFF3E0
        style VS fill:#FFF3E0
        style RC fill:#FFF3E0
        style BC fill:#FFF3E0
        style GR fill:#FFF3E0
    end
```

## 9. Error Handling and Retry Logic

```mermaid
stateDiagram-v2
    [*] --> Processing: Start batch indexing
    
    Processing --> GenerateEmbeddings: Batch of 50 docs
    
    GenerateEmbeddings --> ValidateEmbeddings: Embeddings received
    
    ValidateEmbeddings --> UploadToQdrant: Valid (768-D, non-zero)
    ValidateEmbeddings --> RetryCheck: Invalid embeddings
    
    UploadToQdrant --> Success: Upload successful
    UploadToQdrant --> RetryCheck: Upload failed
    
    RetryCheck --> GenerateEmbeddings: Retry < 3
    RetryCheck --> LogFailure: Retry = 3
    
    LogFailure --> NextBatch: Skip batch, continue
    Success --> NextBatch: Wait 100ms
    
    NextBatch --> Processing: More batches
    NextBatch --> Summary: No more batches
    
    Summary --> [*]: Complete with report
```

## 10. Performance Metrics Tracking

```mermaid
graph TB
    subgraph "Performance Monitoring"
        Start[RAG Query Start] --> Timer1[Start Timer]
        
        Timer1 --> Search[Vector Search]
        Search --> Timer2[End Timer]
        Timer2 --> RecordSearch[Record: vectorSearch time]
        
        RecordSearch --> BuildContext[Build Context]
        BuildContext --> RecordContext[Record: contextSize]
        
        RecordContext --> RecordChunks[Record: chunksRetrieved]
        
        RecordChunks --> Analysis[Statistical Analysis:<br/>- Avg score<br/>- Max score<br/>- Min score<br/>- Score range]
        
        Analysis --> Debug{Debug Mode?}
        Debug -->|Yes| DetailedLog[Log detailed info:<br/>- Query vector sample<br/>- Each result score<br/>- Matched keywords<br/>- Score categories]
        Debug -->|No| BasicLog[Basic logging]
        
        DetailedLog --> End[Query Complete]
        BasicLog --> End
    end
    
    style Start fill:#4CAF50
    style End fill:#4CAF50
    style Debug fill:#FFC107
```

---

## Key Technical Details

### Vector Dimensions
- **Size**: 768 dimensions (Gemini text-embedding-004)
- **Distance Metric**: Cosine similarity
- **Range**: 0.0 (unrelated) to 1.0 (identical)

### Chunking Strategy
- **Size**: 1500 characters per chunk
- **Overlap**: 300 characters between chunks
- **Separators**: `['\n\n', '\n', '. ', ' ', '']`

### Batch Processing
- **Batch Size**: 50 documents
- **Retry Logic**: 3 attempts per batch
- **Delay**: 100ms between batches, 2000ms between retries

### Search Configuration
- **Default Limit**: 3 chunks (optimized from 5)
- **Score Threshold**: 0.4 (40% similarity minimum)
- **Payload**: Includes full text + metadata

### Score Categories
- 🟢 **PERFECT**: 0.90-1.00
- 🟢 **EXCELLENT**: 0.75-0.89
- 🟡 **GOOD**: 0.60-0.74
- 🟡 **FAIR**: 0.45-0.59
- 🔴 **WEAK**: 0.30-0.44
- ⚫ **POOR**: < 0.30
