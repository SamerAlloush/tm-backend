import { Conversation } from '../entities/conversation';

export interface ConversationRepository {
  create(conversation: Conversation): Promise<Conversation>;
  findById(id: string): Promise<Conversation | null>;
  findByParticipant(userId: string): Promise<Conversation[]>;
  update(conversation: Conversation): Promise<Conversation>;
  delete(id: string): Promise<void>;
} 