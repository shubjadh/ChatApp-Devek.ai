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
git clone https://github.com/yourusername/project.git
cd project
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

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3500](http://localhost:3500) (if applicable)

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
│   │   ├── components/
│   │   │   ├── chat.tsx
│   │   │   ├── chatHistory.tsx
│   │   │   └── App.tsx
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



