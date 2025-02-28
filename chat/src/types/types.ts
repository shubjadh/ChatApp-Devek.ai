export interface ChatMessage {
    id: string;
    username: string;
    content: string;
    timestamp: number;
    roomId: string;
    userId: string;
  }
  
  export interface User {
    userId: string;
    userName: string; 
  }