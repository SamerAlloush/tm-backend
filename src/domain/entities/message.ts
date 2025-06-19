export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string[]; // attachment IDs
  sentAt: Date;
  readBy: string[]; // user IDs
} 