export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  lastMessageAt: Date;
} 