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
