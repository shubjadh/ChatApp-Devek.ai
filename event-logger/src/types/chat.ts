export interface User{

    userId : string;
    userName : string;
}

export interface ChatMessage{
    id? : string;
    timestamp : number;
    userId : string;
    username : string;
    content : string;
    roomId : string;

}

export interface ChatEvent{
    type : 'message' | 'join' | 'leave' | 'typing' | 'auth';
    user : User;
    message? : ChatMessage;
    roomId? : string;
    isTyping? : boolean;

}

