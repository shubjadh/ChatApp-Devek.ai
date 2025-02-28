import express from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { ChatEvent, User, ChatMessage } from './types/chat';
import { chatService } from './services/chatService';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';



const app = express();
app.use(express.json());
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<string, { ws: WebSocket, user: User, roomId: string }>();


// REST API endpoint for getting chat History
app.get('/api/chat/:roomId/messages', async (req, res) => {
    try {
        const { roomId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const messages = await chatService.getRoomMessages(roomId , limit);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages :', error);
        res.status(500).json({ error: 'Internal server error'});
    }
});

// REST API endpoint for getting users in a room
app.get('/api/chat/:roomId/users', async (req, res) => {

    try {
        const { roomId } = req.params;
        const userIds = await chatService.getRoomUsers(roomId);
        const users = await Promise.all(
            userIds.map(async (id) => await chatService.getUser(id))
        );
        res.json(users.filter(user => user !== null));
    }
    catch (error) {

        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
            
});

function broadcastToRoom(roomId: string, event: ChatEvent): void {
    clients.forEach((client, userId) =>{
        if (client.roomId === roomId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(event));
        }
    });

}

wss.on('connection', (ws: WebSocket) => {
    let userId: string = uuidv4();
    let user : User | null = null;
    let roomId : string | null = null;  
    
    ws.on('message', async (message: string) => {
        try {
            const event : ChatEvent = JSON.parse(message.toString());

            switch(event.type){
                case 'auth' :
                    user = event.user;
                    roomId = event.roomId || 'general';

                    await chatService.storeUser(user);
                    await chatService.addUserToRoom(user.userId, roomId);

                    clients.set(user.userId, { ws, user, roomId});

                    broadcastToRoom(roomId,{ 
                        type: 'join',
                        user, 
                        roomId
                    });
                    break;
                
                    case 'message':
                        if (!user || !roomId) break;
                        
                        // Make sure to include all necessary fields in the message
                        const chatMessage: ChatMessage = {
                            id: uuidv4(),
                            timestamp: Date.now(),
                            userId: user.userId,
                            username: user.userName, // Make sure username is included here
                            content: event.message?.content || '',
                            roomId
                        };
                        
                        // Store and broadcast the complete message
                        const savedMessage = await chatService.storeMessage(chatMessage);
                        console.log('Broadcasting message:', savedMessage); // Add this log to debug
                        
                        broadcastToRoom(roomId, {
                            type: 'message',
                            user,
                            message: savedMessage,
                            roomId
                        });
                        break;
                
                    case 'typing':
                        if (!user || !roomId) break;
                        
                        console.log(`User ${user.userName} typing status: ${event.isTyping}`);
                        
                        broadcastToRoom(roomId, {
                            type: 'typing',
                            user,
                            roomId,
                            isTyping: event.isTyping
                        });
                        break;

            }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

ws.on('close', async () => {
    if (user && roomId) {

        // remove user from room
        await chatService.removeUserFromRoom(user.userId, roomId);

        // Notify all about user leaving
        broadcastToRoom(roomId, {
            type: 'leave',
            user,
            roomId
        });


        //Removes client connection
        clients.delete(user.userId);
    }
});
});

const PORT = process.env.PORT || 3500;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
