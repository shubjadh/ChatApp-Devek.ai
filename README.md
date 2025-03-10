# ChatApp-Devek.ai

## Description

A real-time chat application using WebSockets, Redis, and TypeScript with a React frontend and a Node.js backend.

## Technologies Used

- **Frontend:** React (TypeScript), Create React App
- **Backend:** Node.js, TypeScript, WebSockets
- **Database/Cache:** Redis
- **Containerization:** Docker, Docker Compose

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Redis](https://redis.io/docs/getting-started/installation/)
- **Global Dependencies** (if not already installed):
  ```sh
  npm install -g typescript nodemon
  ```

## Installation

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/ChatApp-Devek.ai.git
cd ChatApp-Devek.ai-main
```

### 2. Install Dependencies

Since `node_modules` is not included in the repository, install dependencies manually:

#### Backend

```sh
cd event-logger
npm install
```

#### Frontend

```sh
cd chat
npm install
```

## Running the Project

### Before Running

- Ensure Redis is installed and running on your system
- Make sure all dependencies are installed (`npm install` in both `event-logger` and `chat`)
- Ensure TypeScript is globally installed: `npm install -g typescript`

### Option 1: Using Docker (Recommended)

Run the application using Docker Compose:

```sh
docker-compose up --build
```

This will start:

- The backend server
- The frontend application
- Redis (for caching)

### Option 2: Running Locally

#### Start Redis

```sh
redis-server
```

#### Start the Backend

```sh
cd backend(event-logger)
npm run dev
```

#### Start the Frontend

```sh
cd frontend(chat)
npm start
```

Once started, access the application at:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3500](http://localhost:3500) (if applicable)

# Troubleshooting Redis Connection Issues (IF NOT USING DOCKER):

## Redis Connection Error

When running the application locally (not using Docker), you might encounter this error:

```
[ioredis] Unhandled error event: Error: getaddrinfo ENOTFOUND redis
    at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:109:26)
```

## Cause

This error occurs because the application is trying to connect to Redis using the hostname "redis" (which is the service name in Docker Compose) instead of "localhost".

## Solution

Edit the Redis connection configuration in your backend code:

1. Locate the Redis configuration file (likely in `backend/src/config/redis.ts`)

2. Modify the connection settings to use an environment variable with a fallback:

```typescript
// Example fix
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisClient = new Redis({
  host: redisHost,
  port: 6379,
  // other configuration options...
});
```

to:
```
const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
  // other configuration options...
});
```

3. When running with Docker, set the `REDIS_HOST` environment variable to "redis"

4. When running locally, change to:  "localhost"

## Implementation Details

### Docker Compose Environment Variable

If you're using Docker Compose, add the environment variable to your backend service:

```yaml
services:
  backend:
    # ... other configuration
    environment:
      - REDIS_HOST=redis
```

### Local Development

For local development, you don't need to set any environment variables. The code will default to 'localhost'.

## Verifying the Fix

After making the changes:

1. Restart your application
2. Check the server logs - you should no longer see the Redis connection error
3. The chat functionality should work correctly in both Docker and local environments

## Testing the Application

To test the real-time chat functionality:

1. Open the frontend URL ([http://localhost:5173](http://localhost:5173)) in multiple browser tabs
2. Choose the same chat room in each tab (e.g., "general" room which is the default)
3. Messages sent in one tab should appear instantly in all other tabs connected to the same room
4. You can use different rooms too, just type in a room name. If other user use that room name they will connect to that specific room.

### Chat History Access

To access chat history:

1. Click on "View History" button to view previous messages
2. By default, this will show the history for the "general" room
3. If you are using a different room, you need to:
   - Type that specific room name in the room name input section
   - Click the view history button to retrieve chat history for that particular room

# This is a basic implementation focusing on core functionality.

## Architecture & Design Choices

1. **WebSockets for Real-Time Communication:**
   - Used to enable instant message delivery.
   - Handles user connections and disconnections dynamically.

2. **Redis for Performance & Scalability:**
   - Stores chat messages for quick retrieval.
   - Manages real-time chat rooms efficiently.

3. **Modular Backend Architecture:**
   - Separation of concerns: WebSocket handling, database access, and chat services.
   - Scalable and maintainable structure.

4. **React with TypeScript:**
   - Ensures type safety and maintainability.
   - Provides a clean and interactive UI for real-time chat.

## Additional Features Implemented

- **Typing Indicator:** Displays when another user is typing.
- **User Presence Tracking:** Shows online/offline status.
- **Persisted Chat History:** Enables users to view previous messages.

## Dockerization & Deployment

This project is fully containerized using Docker:

- **`Dockerfile` for Backend:** Defines the Node.js environment, installs dependencies, and runs the WebSocket server.
- **`Dockerfile` for Frontend:** Uses Node.js to build the React app and serves it via Nginx.
- **`docker-compose.yml`** automates multi-container deployment, including Redis.
- **`Redis Hosting:`** Redis is deployed inside the Docker container and accessible via the redis service name within the Docker network.

To deploy, simply run:

```sh
docker-compose up --build -d
```

## Project Structure

```
project/
│
├── backend/              # Backend server
│   ├── src/
│   │   ├── server.ts     # Entry point
│   │   ├── services/
│   │   │   └── chatService.ts
│   │   ├── config/
│   │   │   └── redis.ts
│   │   └── types/
│   │       └── chat.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── node_modules/
│
├── frontend/             # Frontend application
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── chat.tsx
│   │   │   └── chatHistory.tsx
│   │   ├── types/
│   │   │   └── types.ts
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── node_modules/
│
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # Project documentation
```

Thanks!🚀
