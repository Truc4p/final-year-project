# 6. Implementation

## 6.1 Development Environment

| Aspect | Details |
|---|---|
| IDE | Visual Studio Code with extensions for debugging and linting, supporting JavaScript, Vue.js, and Python |
| Version Control | Git and GitHub with Issues and Projects for collaborative development tracking |
| Project Management | Trello and GitHub Projects for organizing tasks across multiple modules |
| Runtime | Node.js 16.20.1 with npm for package management |
| Containerization | Docker for consistent development, testing, and production deployments |
| API Documentation and Testing | Swagger UI integrated at /api-docs; Postman for comprehensive endpoint validation and integration testing |
| Logging and Monitoring | Morgan (optional) for HTTP request logging; express-rate-limit for DDoS protection |
| Backend Technology Stack | Express.js, Mongoose, JSON Web Tokens (JWT), Multer, WebSocket (ws), Swagger JSDoc, Swagger UI Express, express-rate-limit, Nodemailer, @google/generative-ai, LangChain, @qdrant/js-client-rest |
| Frontend Technology Stack | Vue 3, Vue Router, Vue i18n, Tailwind CSS, Axios, Chart.js, Vue Chart.js |
| Mobile Applications | React Native with Expo for admin and customer platforms targeting iOS and Android |

## 6.2 Backend & Frontend Implementation

### Folder Structure
#### Backend

| Layer | Folder/File | Purpose | Key Responsibilities |
|-------|-------------|---------|----------------------|
| **Core Layers** | | | |
| | `controllers/` | Entry point for HTTP requests | Handles routing logic, request validation, and response formatting |
| | `routes/` | API endpoint definitions | Maps HTTP routes to controller methods and applies middleware |
| | `services/` | Business logic layer | Core application functionality, data processing, and business rules |
| | `models/` | Data models/schemas | Defines database structure, validation rules, and data relationships |
| | `middleware/` | Cross-cutting concerns | Authentication, logging, error handling, and request preprocessing |
| **Supporting Modules** | | | |
| | `knowledge-sources/, tools/, utils/, seed-data/, scripts/, uploads/` | Domain utilities & initialization | AI knowledge sources, common helpers, DB seeding, batch scripts, media storage |
| **Infrastructure** | | | |
| | `app.js`, `server.js`, `db.js`, `swagger.js`, `websocket.js`, `Dockerfile`, `docker-compose.qdrant.yml`, `.env` | Configuration & Setup Files | Server initialization, database connection, API docs, WebSocket, containerization |

**Architecture Pattern:** This is a classic **MVC-inspired Node.js backend** with clear separation between request handling (controllers/routes), business logic (services), and data management (models), plus specialized modules for domain-specific features and infrastructure concerns.

### Meaningful Code Sample:

1) Model — chat, views, and retrieval helpers

```javascript
// backend/models/livestream/liveStream.js
// Methods and statics used throughout the livestream workflow

// Method to increment view count
liveStreamSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to add chat message
liveStreamSchema.methods.addChatMessage = function(username, message, isAdmin = false) {
  this.chatMessages.push({
    username,
    message,
    timestamp: new Date(),
    isAdmin
  });
  return this.save();
};

// Static method to get active stream
liveStreamSchema.statics.getActiveStream = function() {
  return this.findOne({ isActive: true });
};

// Static method to get past streams (excludes chat for performance)
liveStreamSchema.statics.getPastStreams = function(limit = 10, skip = 0) {
  return this.find({ 
    isActive: false,
    endTime: { $exists: true }
  })
  .sort({ endTime: -1 })
  .limit(limit)
  .skip(skip)
  .select('-chatMessages');
};
```

2) Controller — safe start/stop with final stats

```javascript
// backend/controllers/livestream/liveStreamController.js
// Create a new livestream. Prevent duplicate active streams; auto-clean if a stream is stuck > 24h
exports.createLiveStream = async (req, res) => {
  try {
    const { title, description, quality, categories, tags, streamUrl } = req.body;

    // Ensure only one active stream at a time; auto-clean if stuck > 24h
    let activeStream = await LiveStream.getActiveStream();
    if (activeStream) {
      const hoursSinceStart = (Date.now() - activeStream.startTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceStart > 24) {
        activeStream.isActive = false;
        activeStream.endTime = new Date();
        activeStream.duration = Math.floor((Date.now() - activeStream.startTime.getTime()) / 1000);
        await activeStream.save();
      } else {
        return res.status(400).json({ 
          message: 'Another livestream is currently active. Please stop it before starting a new one.' 
        });
      }
    }

    const liveStream = new LiveStream({
      title,
      description,
      quality,
      streamUrl: streamUrl || '',
      categories: categories ? categories.split(',').map(c => c.trim()) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isActive: true,
      startTime: new Date(),
      createdBy: req.user ? req.user.id : null
    });

    await liveStream.save();
    res.status(201).json({ message: 'Livestream created successfully', livestream: liveStream });
  } catch (error) {
    console.error('Error creating livestream:', error);
    res.status(500).json({ message: 'Failed to create livestream', error: error.message });
  }
};

// Stop livestream. Computes duration and persists final metrics and media references.
exports.stopLiveStream = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoUrl, thumbnailUrl, maxViewers, viewCount, likes } = req.body;

    const livestream = await LiveStream.findById(id);
    if (!livestream) return res.status(404).json({ message: 'Livestream not found' });
    if (!livestream.isActive) return res.status(400).json({ message: 'Livestream is not active' });

    // Finalize stream
    const endTime = new Date();
    const duration = Math.floor((endTime - livestream.startTime) / 1000);

    livestream.isActive = false;
    livestream.endTime = endTime;
    livestream.duration = duration;
    livestream.isRecorded = !!videoUrl;
    livestream.videoUrl = videoUrl || '';
    livestream.thumbnailUrl = thumbnailUrl || '';
    livestream.maxViewers = maxViewers || livestream.maxViewers;
    livestream.viewCount = viewCount || livestream.viewCount;
    livestream.likes = likes || livestream.likes;

    await livestream.save();
    res.json({ message: 'Livestream stopped successfully', livestream });
  } catch (error) {
    console.error('Error stopping livestream:', error);
    res.status(500).json({ message: 'Failed to stop livestream', error: error.message });
  }
};
```

3) WebSocket — reactions and viewer count with single-like enforcement

```javascript
// backend/websocket.js
// Each user (auth userId) or guest (sessionId) can only like once; state is broadcast to all clients.
async handleToggleLike(ws, data) {
  const { userId, sessionId } = data;
  const identifier = userId || sessionId; // prefer userId
  if (!identifier) return;
  if (!this.currentStreamState.isActive) {
    return ws.send(JSON.stringify({ type: 'error', message: 'No active stream' }));
  }

  // Toggle like in memory and persist to DB
  const hasLiked = this.currentStreamState.likedBy.has(identifier);
  if (hasLiked) {
    this.currentStreamState.likedBy.delete(identifier);
    this.currentStreamState.likes = Math.max(0, this.currentStreamState.likes - 1);
  } else {
    this.currentStreamState.likedBy.add(identifier);
    this.currentStreamState.likes++;
  }

  // Persist aggregate like count and who liked
  if (this.currentStreamState.streamId) {
    const LiveStream = require('./models/livestream/liveStream');
    await LiveStream.findByIdAndUpdate(this.currentStreamState.streamId, {
      likes: this.currentStreamState.likes,
      likedBy: Array.from(this.currentStreamState.likedBy)
    });
  }

  // Broadcast to all viewers/admins
  const updateData = {
    type: 'stream_update',
    likes: this.currentStreamState.likes,
    likedBy: Array.from(this.currentStreamState.likedBy)
  };
  for (const c of this.customerConnections.values()) if (c.ws.readyState === WebSocket.OPEN) c.ws.send(JSON.stringify(updateData));
  for (const a of this.adminConnections.values()) if (a.ws.readyState === WebSocket.OPEN) a.ws.send(JSON.stringify(updateData));
}

// Viewer count is derived from active WebSocket sessions and broadcast to all clients.
async updateViewerCount() {
  const viewerCount = this.customerConnections.size;
  this.currentStreamState.viewerCount = viewerCount;

  const updateData = { type: 'stream_update', viewerCount };
  for (const c of this.customerConnections.values()) if (c.ws.readyState === WebSocket.OPEN) c.ws.send(JSON.stringify(updateData));
  for (const a of this.adminConnections.values()) if (a.ws.readyState === WebSocket.OPEN) a.ws.send(JSON.stringify(updateData));
}
```

How this fits the architecture
- Layered flow: Controller orchestrates lifecycle; WebSocket provides real-time state; Model persists durable data.
- Safety: Only one active stream; duration and final stats are computed on stop.
- Real-time UX: Likes and viewer counts update instantly; server enforces one-like-per-user/session.
- Performance: Past streams query excludes chat messages to keep responses light. 

### Frontend 


## 6.3 Database Implementation

### MongoDB Atlas and Mongoose Integration

The physical database was implemented using MongoDB Atlas, a fully managed cloud database service providing high availability, automated backups, and global distribution capabilities. The connection is established through Mongoose, an Object Data Modeling (ODM) library that provides schema validation, middleware hooks, and query building utilities. The db.js file contains the connection logic, establishing a secure connection to the MongoDB cluster using connection strings with authentication credentials.

### Schema Design and Collection Structure

The database schema reflects the modular architecture of the application, with collections organized by functional domain. The ecommerce module includes Product, Category, Order, and Payment collections. The auth module contains User and Session collections with password hashing and token management. The livestream module includes LiveStream, StreamComment, and StreamLike collections for real-time interaction tracking. The communication module contains Chat and Message collections for user messaging. The marketing module includes Newsletter, EmailCampaign, EmailTemplate, and EmailSegment collections for campaign management. The finance module contains CashFlow records for financial tracking. The hr module includes Employee, Department, and Leave records. The skin-study module contains DermatologyRecord and SkinAnalysis collections for specialized analysis features.

### Vector Database Integration

Qdrant, a vector database optimized for similarity search and retrieval-augmented generation (RAG), was deployed using Docker Compose as defined in docker-compose.qdrant.yml. The vectorService.js module provides an abstraction layer for vector operations, enabling semantic search capabilities across product descriptions, customer reviews, and knowledge base content. This integration supports advanced features such as AI-powered product recommendations and intelligent customer support through RAG-enhanced chatbots.

### Data Initialization and Seeding

The backend includes seed scripts under the seed-data directory that populate the database with initial content. The seedChatData.js script initializes chat templates and conversation starters, while seedEmailTemplates.js populates email campaign templates. These scripts ensure that the application has essential data available immediately after deployment, reducing setup time and providing a consistent baseline for testing and demonstration.

## 6.4 Deployment

### Containerization Strategy

The application was containerized using Docker to ensure consistency across development, staging, and production environments. The backend Dockerfile specifies Node.js 16.20.1 as the base image, installs dependencies from package.json, copies application code, exposes port 3000, and executes npm start as the entry point. The frontend includes a separate Dockerfile that builds the Vue application using npm run build and serves the static dist directory through a lightweight HTTP server. The Qdrant vector database is orchestrated through docker-compose.qdrant.yml, defining the service configuration, port mappings, and persistent volume mounts.

### Local Development Deployment

For local development, the backend is deployed by building the Docker image with docker build -t wrencos-backend ./backend and running it with docker run -p 3000:3000 --env-file .env wrencos-backend, exposing the API on localhost:3000. The Qdrant service is started with docker compose -f backend/docker-compose.qdrant.yml up -d, making the vector database available on localhost:6333. The frontend development server is launched with npm run dev in the frontend directory, providing hot module reloading for rapid iteration during development.

### Production Deployment

For production deployment, the application can be deployed to cloud platforms such as Render, Railway, AWS EC2, or Heroku. The deployment process involves pushing the Docker images to a container registry, configuring environment variables including PORT, GEMINI_API_KEY, JWT_SECRET, SMTP credentials, and MongoDB connection strings, and deploying the containers through the platform's orchestration system. HTTPS is enforced through a reverse proxy such as Nginx or the platform's built-in SSL termination. Database backups are configured through MongoDB Atlas's automated backup feature with point-in-time recovery capabilities. The WebSocket connection is maintained through the reverse proxy's WebSocket upgrade support, enabling real-time features in production.

### Environment Configuration

The application uses environment variables defined in .env files for configuration management. Critical variables include GEMINI_API_KEY for AI features, JWT_SECRET for token signing, MONGODB_URI for database connection, SMTP credentials for email services, and QDRANT_URL for vector database access. The server.js file includes startup checks that warn if critical variables such as GEMINI_API_KEY are not configured, allowing graceful degradation of optional features while maintaining core functionality.

## 6.5 Project Management

### Task Tracking and Collaboration

Project management was conducted through GitHub Projects and Trello boards, providing visibility into task status, priority, and assignment. The task tracking system organized work into columns representing workflow stages: Backlog for future work, In Progress for active development, Review for code review and testing, and Done for completed features. Each task card included acceptance criteria, estimated effort, assigned team members, and linked pull requests or commits. This structured approach ensured that all team members understood priorities and dependencies, reducing context-switching overhead and improving delivery predictability.

### Version Control and Commit History

The project maintained a comprehensive commit history on GitHub demonstrating consistent, incremental development. Feature branches were created for each major feature (e.g., feature/ecommerce, feature/livestream, feature/ai-dermatology) and merged into the main branch through pull requests after code review. Commit messages followed a consistent format describing the changes made, enabling easy navigation of project history and identification of when specific features were introduced. The commit graph shows regular activity across multiple team members, indicating active collaboration and distributed development effort. Hotfix branches were created for production issues, ensuring rapid resolution without disrupting ongoing feature development.

### Documentation and Knowledge Management

Technical documentation was maintained in Markdown files within the report directory, including requirements analysis, system design, and implementation details. API documentation was automatically generated through Swagger JSDoc and served through the Swagger UI, ensuring that API specifications remained synchronized with implementation. Database schema documentation was maintained through Mongoose schema definitions with inline comments explaining field purposes and constraints. This multi-layered documentation approach ensured that knowledge was captured at the appropriate level of abstraction, from high-level architecture decisions to low-level implementation details.
