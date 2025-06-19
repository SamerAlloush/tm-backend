import { ConversationRepository } from '../../repositories/conversationRepository';
import { Conversation } from '../../entities/conversation';

export class GetConversationsForUser {
  constructor(private conversationRepository: ConversationRepository) {}

  async execute(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.findByParticipant(userId);
  }
} 