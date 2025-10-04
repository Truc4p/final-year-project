# Chat Session Persistence Implementation

This document outlines the changes made to implement persistent chat sessions that maintain continuity when customers navigate between pages.

## Problem
Previously, when customers chatted with staff and navigated to another page, the chat session would be lost and they would have to start a new conversation, losing all chat history.

## Solution Overview
Implemented a comprehensive session persistence system that:
1. Stores chat session IDs in browser localStorage
2. Differentiates between authenticated and anonymous users
3. Restores chat state including staff chat connections
4. Automatically recovers lost sessions for authenticated users

## Backend Changes

### 1. Enhanced Conversation History Endpoint
**File:** `backend/controllers/chatController.js`

Updated `getConversationHistory` function to return conversation state information:
- `isStaffChat`: Whether this is a staff chat conversation
- `waitingForStaff`: Whether customer is waiting for staff response
- `isActive`: Whether conversation is still active
- `hasUnreadFromCustomer`: Whether there are unread customer messages
- `assignedStaff`: Staff member assigned to this conversation

### 2. New User Conversation Recovery Endpoint
**File:** `backend/controllers/chatController.js`

Added `findUserConversation` function that:
- Finds the most recent active conversation for authenticated users
- Only returns conversations from the last 24 hours
- Helps recover sessions when localStorage is cleared

**File:** `backend/routes/chatRoutes.js`

Added new route: `GET /chat/find-user-conversation`

## Frontend Changes

### 1. Persistent Session Management
**File:** `frontend/src/components/ChatWidget.vue`

#### New Functions:
- `getOrCreateSessionId()`: Creates or retrieves persistent session IDs
  - For authenticated users: `chatSession_user_{userId}`
  - For anonymous users: `chatSession_anonymous`
  - Attempts to recover lost sessions from server for authenticated users

- `clearSessionId()`: Properly clears stored sessions

- `handleUserAuthChange()`: Manages session transitions during login/logout

#### Enhanced Functions:
- `initializeChat()`: Now properly restores chat state and resumes staff chat polling
- `loadConversationHistory()`: Restores conversation state from backend
- `clearChat()`: Uses async session management

### 2. Session State Recovery
The system now properly restores:
- Chat message history
- Staff chat connection status
- Waiting for staff status
- Automatic resumption of staff message polling

## Usage

### For Authenticated Users
1. Chat sessions are tied to user ID
2. Sessions persist across browser tabs and page reloads
3. If localStorage is cleared, sessions are recovered from server
4. When logging out, authenticated session is cleared and anonymous session starts

### For Anonymous Users
1. Single session stored globally for the browser
2. Sessions persist across page reloads within the same browser
3. Clearing browser data will start fresh session

### Session Management
- **Clear Chat**: Creates new session while keeping user authentication state
- **Login/Logout**: Automatically handles session transitions
- **Page Navigation**: Sessions persist automatically
- **Browser Refresh**: Sessions are restored with full state

## Key Features

1. **Seamless Continuity**: Customers can navigate freely without losing chat context
2. **Staff Chat Persistence**: Staff conversations resume automatically with polling
3. **Smart Recovery**: Lost sessions are recovered for authenticated users
4. **Authentication-Aware**: Different handling for logged-in vs anonymous users
5. **Automatic Cleanup**: Sessions expire after 24 hours of inactivity

## Testing Scenarios

1. **Basic Persistence**: Start chat, navigate away, return - chat should continue
2. **Staff Chat**: Connect to staff, navigate away, return - should resume staff chat
3. **Login During Chat**: Anonymous chat should transition to authenticated session
4. **Logout During Chat**: Authenticated chat should continue as anonymous
5. **Browser Refresh**: All chat state should be restored
6. **Multiple Tabs**: Each tab shares the same session for the user

## Technical Notes

- Session IDs are stored in localStorage with user-specific keys
- Backend tracks conversation metadata for state restoration
- Frontend automatically resumes staff chat polling when appropriate
- Sessions are limited to 24 hours for security and storage efficiency
- Authentication state changes trigger proper session transitions