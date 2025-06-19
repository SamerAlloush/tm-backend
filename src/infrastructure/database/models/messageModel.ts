import mongoose, { Document, Schema } from 'mongoose';

export interface MessageDocument extends Document {
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  sentAt: Date;
  readBy: string[];
}

const MessageSchema = new Schema<MessageDocument>({
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  sentAt: { type: Date, required: true },
  readBy: [{ type: String }],
});

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema); 