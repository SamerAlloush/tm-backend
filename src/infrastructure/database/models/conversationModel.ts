import mongoose, { Document, Schema } from 'mongoose';

export interface ConversationDocument extends Document {
  participants: string[];
  lastMessageAt: Date;
}

const ConversationSchema = new Schema<ConversationDocument>({
  participants: [{ type: String, required: true }],
  lastMessageAt: { type: Date, required: true },
});

export const ConversationModel = mongoose.model<ConversationDocument>('Conversation', ConversationSchema); 