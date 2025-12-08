# Secret Manager Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph "Application Layer"
        APP["Express App<br/>app.js"]
        SERVER["Server<br/>server.js"]
    end
    
    subgraph "Secret Manager System"
        INIT["secretInitializer.js<br/>Initialize & Bootstrap"]
        SM["SecretManager Class<br/>Core Logic"]
        CRYPTO["Crypto Module<br/>AES-256-CBC"]
    end
    
    subgraph "Storage Layer"
        MEMORY["In-Memory Map<br/>Fast Access"]
        ENCRYPTED["Encrypted File<br/>.secrets.enc"]
        KEYFILE["Encryption Key<br/>.secret-key"]
        ENV["Environment Variables<br/>process.env"]
    end
    
    subgraph "CLI Interface"
        CLI["secretCLI.js<br/>Command Handler"]
    end
    
    APP -->|Initialize on startup| INIT
    INIT -->|Setup & Configure| SM
    SM -->|Encrypt/Decrypt| CRYPTO
    SM -->|Read/Write| MEMORY
    SM -->|Persist| ENCRYPTED
    CRYPTO -->|Use Key| KEYFILE
    SM -->|Fallback| ENV
    CLI -->|Manage Secrets| SM
    SERVER -->|Access Secrets| SM
```

---

## Initialization Flow

```mermaid
sequenceDiagram
    participant App as Express App
    participant Init as secretInitializer
    participant SM as SecretManager
    participant Crypto as Crypto Module
    participant FS as File System
    participant Env as Environment
    
    App->>Init: initializeSecrets()
    Init->>SM: initialize()
    
    SM->>FS: Check .secret-key exists?
    alt Key exists
        FS-->>SM: Load encryption key
    else Key missing
        SM->>Crypto: Generate random 32 bytes
        Crypto-->>SM: New key
        SM->>FS: Save to .secret-key
    end
    
    SM->>FS: Check .secrets.enc exists?
    alt File exists
        FS-->>SM: Read encrypted data
        SM->>Crypto: Decrypt with key
        Crypto-->>SM: Decrypted JSON
        SM->>SM: Load into Map
    else File missing
        SM->>SM: Start with empty Map
    end
    
    SM->>Env: Load from environment variables
    Env-->>SM: JWT_SECRET, API_KEYS, etc.
    
    SM->>SM: Generate defaults if missing
    SM->>SM: Migrate from .env if exists
    
    Init-->>App: ✅ Secrets initialized
```

---

## Get Secret Flow

```mermaid
graph TD
    A["getSecret(key)"] -->|Check| B{Secret in<br/>Memory Map?}
    
    B -->|YES| C["Return from Map<br/>⚡ Fast Access"]
    C --> D["✅ Return Value"]
    
    B -->|NO| E{Check<br/>Environment?}
    E -->|Found| F["Return from<br/>process.env"]
    F --> D
    
    E -->|Not Found| G["❌ Throw Error<br/>Secret not found"]
    
    style C fill:#90EE90
    style D fill:#90EE90
    style F fill:#FFD700
    style G fill:#FF6B6B
```

---

## Set Secret Flow

```mermaid
graph TD
    A["setSecret(key, value)"] -->|Validate| B{Key & Value<br/>provided?}
    
    B -->|NO| C["❌ Throw Error"]
    
    B -->|YES| D["Store in<br/>Memory Map"]
    D --> E["Serialize Map<br/>to JSON"]
    E --> F["Encrypt JSON<br/>AES-256-CBC"]
    F --> G["Write to<br/>.secrets.enc"]
    G --> H["✅ Secret Saved"]
    
    style H fill:#90EE90
    style C fill:#FF6B6B
```

---

## Encryption/Decryption Process

```mermaid
graph LR
    subgraph "Encryption"
        A["Plain Text<br/>Secret Value"] -->|Generate| B["Random IV<br/>16 bytes"]
        B -->|Use| C["Encryption Key<br/>32 bytes"]
        C -->|AES-256-CBC| D["Encrypted Data<br/>Hex String"]
        D -->|Concatenate| E["IV + Encrypted<br/>Buffer"]
        E -->|Save| F[".secrets.enc<br/>File"]
    end
    
    subgraph "Decryption"
        F -->|Read| G["IV + Encrypted<br/>Buffer"]
        G -->|Extract| H["IV<br/>First 16 bytes"]
        G -->|Extract| I["Encrypted Data<br/>Remaining bytes"]
        H -->|Use| J["Encryption Key<br/>32 bytes"]
        I -->|AES-256-CBC| K["Decrypted Text<br/>UTF-8"]
        K -->|Parse| L["JSON Object<br/>All Secrets"]
    end
    
    style F fill:#FFD700
    style L fill:#90EE90
```

---

## Secret Storage Architecture

```mermaid
graph TB
    subgraph "Runtime"
        MEMORY["In-Memory Map<br/>secretManager.secrets<br/><br/>KEY → VALUE<br/>JWT_SECRET → abc123...<br/>API_KEY → xyz789...<br/>...<br/><br/>⚡ Fastest Access"]
    end
    
    subgraph "Persistent Storage"
        ENCRYPTED[".secrets.enc<br/>Encrypted File<br/><br/>Binary Data:<br/>IV + Encrypted JSON<br/><br/>🔒 Secure at Rest"]
        KEYFILE[".secret-key<br/>Encryption Key<br/><br/>32 bytes<br/>Random Key<br/><br/>🔑 Key Material"]
    end
    
    subgraph "Fallback"
        ENV["Environment Variables<br/>process.env<br/><br/>JWT_SECRET=...<br/>MONGODB_URI=...<br/>...<br/><br/>📝 CI/CD Compatible"]
    end
    
    MEMORY -->|Load on startup| ENCRYPTED
    MEMORY -->|Use for encryption| KEYFILE
    MEMORY -->|Fallback| ENV
    
    style MEMORY fill:#90EE90
    style ENCRYPTED fill:#FFD700
    style KEYFILE fill:#FF6B6B
    style ENV fill:#87CEEB
```

---

## CLI Command Flow

```mermaid
graph TD
    A["npm run secrets &lt;command&gt;"] --> B{Which Command?}
    
    B -->|list| C["Get all secret keys<br/>from Map"]
    C --> C1["Display key names"]
    
    B -->|get &lt;key&gt;| D["Retrieve secret value"]
    D --> D1["Display value"]
    
    B -->|set &lt;key&gt; &lt;value&gt;| E["Store new secret"]
    E --> E1["Save encrypted"]
    
    B -->|delete &lt;key&gt;| F["Confirm deletion"]
    F --> F1["Remove from Map"]
    F1 --> F2["Update encrypted file"]
    
    B -->|health| G["Check status"]
    G --> G1["Show initialized,<br/>count, key present"]
    
    B -->|export| H["Export all secrets"]
    H --> H1["JSON with timestamp"]
    
    B -->|admin-key| I["Show admin key"]
    I --> I1["Display ADMIN_KEY"]
    
    style C1 fill:#87CEEB
    style D1 fill:#87CEEB
    style E1 fill:#90EE90
    style F2 fill:#90EE90
    style G1 fill:#87CEEB
    style H1 fill:#FFD700
    style I1 fill:#FF6B6B
```

---

## Data Flow: Complete Lifecycle

```mermaid
graph TB
    subgraph "1. Initialization"
        A["App Starts"] --> B["initializeSecrets()"]
        B --> C["Load/Generate Encryption Key"]
        C --> D["Load Encrypted Secrets"]
        D --> E["Load Environment Variables"]
        E --> F["Generate Defaults"]
    end
    
    subgraph "2. Runtime Operations"
        F --> G{Operation Type}
        G -->|Read| H["getSecret()"]
        G -->|Write| I["setSecret()"]
        G -->|Delete| J["deleteSecret()"]
        
        H --> H1["Check Memory Map"]
        H1 --> H2["Fallback to Env"]
        H2 --> H3["Return Value"]
        
        I --> I1["Update Memory Map"]
        I1 --> I2["Encrypt & Save"]
        I2 --> I3["Persist to Disk"]
        
        J --> J1["Remove from Map"]
        J1 --> J2["Update Encrypted File"]
    end
    
    subgraph "3. Storage"
        H3 --> K["In-Memory Map"]
        I3 --> L["Encrypted File"]
        J2 --> L
        K --> M["Fast Access"]
        L --> N["Secure Persistence"]
    end
    
    style A fill:#87CEEB
    style M fill:#90EE90
    style N fill:#FFD700
```

---

## Security Layers

```mermaid
graph TB
    subgraph "Layer 1: Access Control"
        A["Application Code"] -->|Only via<br/>secretManager| B["Secret Manager"]
        B -->|No direct file access<br/>No plaintext logs|C["Secrets Protected"]
    end
    
    subgraph "Layer 2: Encryption"
        D["Plain Text Secrets"] -->|AES-256-CBC| E["Encrypted Data"]
        E -->|Stored in| F[".secrets.enc"]
    end
    
    subgraph "Layer 3: Key Management"
        G["Encryption Key<br/>32 bytes"] -->|Stored in| H[".secret-key"]
        H -->|Should be in<br/>secure vault| I["Production: AWS/Azure"]
    end
    
    subgraph "Layer 4: Fallback"
        J["Environment Variables"] -->|For CI/CD<br/>Docker containers| K["process.env"]
    end
    
    style C fill:#90EE90
    style F fill:#FFD700
    style I fill:#FF6B6B
    style K fill:#87CEEB
```

---

## Supported Secrets

```mermaid
graph TB
    SM["Secret Manager"] --> AUTH["Authentication"]
    SM --> API["API Keys"]
    SM --> DB["Database"]
    SM --> EMAIL["Email"]
    SM --> PAYMENT["Payment"]
    SM --> CACHE["Cache"]
    SM --> CONFIG["Configuration"]
    
    AUTH --> JWT["JWT_SECRET"]
    AUTH --> ADMIN["ADMIN_KEY"]
    
    API --> GEMINI["GEMINI_API_KEY"]
    API --> QDRANT["QDRANT_API_KEY"]
    
    DB --> MONGO["MONGODB_URI"]
    
    EMAIL --> GMAIL_U["GMAIL_USER"]
    EMAIL --> GMAIL_P["GMAIL_APP_PASSWORD"]
    
    PAYMENT --> VNP_H["VNP_HASH_SECRET"]
    PAYMENT --> VNP_T["VNP_TMN_CODE"]
    
    CACHE --> REDIS["REDIS_URL"]
    
    CONFIG --> NODE["NODE_ENV"]
    CONFIG --> PORT["PORT"]
    CONFIG --> FRONTEND["FRONTEND_URL"]
    CONFIG --> COMPANY["COMPANY_NAME"]
    
    style SM fill:#FFD700
    style JWT fill:#90EE90
    style ADMIN fill:#FF6B6B
    style GEMINI fill:#87CEEB
```

---

## Error Handling

```mermaid
graph TD
    A["Operation"] --> B{Try Execute}
    
    B -->|Success| C["✅ Return Result"]
    
    B -->|File Not Found| D["⚠️ Warn & Continue<br/>Use fallback"]
    
    B -->|Decryption Failed| E["❌ Error<br/>Corrupted data"]
    
    B -->|Secret Not Found| F["❌ Error<br/>Not in Map or Env"]
    
    B -->|Save Failed| G["❌ Error<br/>Disk write issue"]
    
    B -->|Validation Failed| H["❌ Error<br/>Invalid input"]
    
    D --> I["Load from Env"]
    I --> C
    
    E --> J["Log Error"]
    F --> J
    G --> J
    H --> J
    J --> K["Throw Exception"]
    
    style C fill:#90EE90
    style D fill:#FFD700
    style K fill:#FF6B6B
```

---

## Deployment Scenarios

```mermaid
graph TB
    subgraph "Development"
        DEV["Local Machine"] -->|Uses| DEV_SM["secretManager"]
        DEV_SM -->|Reads/Writes| DEV_FILES[".secrets.enc<br/>.secret-key"]
        DEV_FILES -->|Gitignored| DEV_SAFE["🔒 Safe"]
    end
    
    subgraph "CI/CD Pipeline"
        CI["GitHub Actions<br/>GitLab CI"] -->|Uses| CI_ENV["Environment Variables"]
        CI_ENV -->|Injected at| CI_RUN["Runtime"]
        CI_RUN -->|No files needed| CI_SAFE["✅ Secure"]
    end
    
    subgraph "Production"
        PROD["Cloud Server"] -->|Uses| PROD_VAULT["AWS Secrets Manager<br/>Azure Key Vault"]
        PROD_VAULT -->|Adapter pattern| PROD_SM["secretManager"]
        PROD_SM -->|Fetches| PROD_SAFE["🔒 Encrypted"]
    end
    
    style DEV_SAFE fill:#90EE90
    style CI_SAFE fill:#90EE90
    style PROD_SAFE fill:#90EE90
```

---

## Health Check Status

```mermaid
graph TB
    A["healthCheck()"] --> B["Status Object"]
    
    B --> C["initialized<br/>boolean"]
    B --> D["secretsCount<br/>number"]
    B --> E["encryptionKeyPresent<br/>boolean"]
    B --> F["timestamp<br/>ISO string"]
    
    C -->|true| C1["✅ Ready"]
    C -->|false| C2["❌ Not Ready"]
    
    D -->|> 0| D1["✅ Secrets Loaded"]
    D -->|= 0| D2["⚠️ No Secrets"]
    
    E -->|true| E1["✅ Key Available"]
    E -->|false| E2["❌ Key Missing"]
    
    style C1 fill:#90EE90
    style C2 fill:#FF6B6B
    style D1 fill:#90EE90
    style D2 fill:#FFD700
    style E1 fill:#90EE90
    style E2 fill:#FF6B6B
```

