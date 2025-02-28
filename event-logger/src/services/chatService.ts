import { ChatMessage, User } from "../types/chat"; 
import redis from '../config/redis';
import { v4 as uuidv4 } from 'uuid';

class ChatService{
    private static readonly MESSAGE_EXPIRY = 604800; 

    async storeMessage(message : ChatMessage) : Promise<ChatMessage> {
        
        const messageId = message.id || uuidv4();
        const completeMessage = { ...message, id : messageId };

        const key = `chat : ${message.roomId} : messages`;
        await redis.lpush(key, JSON.stringify(completeMessage));
        await redis.expire(key, ChatService.MESSAGE_EXPIRY)

        return completeMessage;
    }

    async getRoomMessages(roomId : string, limit : number = 50) : Promise<ChatMessage[]>{
        
        const key = `chat : ${roomId} : messages`;
        const messages = await redis.lrange(key, 0, limit - 1);
        return messages.map(msg => JSON.parse(msg));

    }

    async storeUser(user : User) : Promise<void>{

        const key = `user : ${user.userId}`;
        await redis.set(key, JSON.stringify(user));
    
    }

    async getUser(userId : string) : Promise< User | null> {
        
        const key = `user : ${userId}`;
        const userData = await redis.get(key);
        return userData ? JSON.parse(userData) : null;

    }

    async addUserToRoom(userId : string, roomId : string) : Promise < void > {
        
        const key = `room : ${roomId} : users`;
        await redis.sadd(key, userId);

    }

    async removeUserFromRoom(userId : string, roomId : string) : Promise < void > {
        
        const key = `room : ${roomId} : users`;
        await redis.srem(key , userId);

    }

    async getRoomUsers(roomId : string) : Promise <string[]> {
        
        const key = `room : ${roomId} : users`;
        return await redis.smembers(key);
    
    }

}

export const chatService = new ChatService();

