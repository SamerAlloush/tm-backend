import { MessageRepository } from '../../repositories/messageRepository';
import { Message } from '../../entities/message';

export class GetMessagesForConversation {
  constructor(private messageRepository: MessageRepository) {}

  async execute(conversationId: string): Promise<Message[]> {
    return this.messageRepository.findByConversation(conversationId);
  }
} 