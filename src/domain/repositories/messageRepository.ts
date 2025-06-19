import { Message } from '../entities/message';

export interface MessageRepository {
  create(message: Message): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByConversation(conversationId: string): Promise<Message[]>;
  update(message: Message): Promise<Message>;
  delete(id: string): Promise<void>;
} 