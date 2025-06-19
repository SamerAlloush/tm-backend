import { ConversationRepository } from '../../repositories/conversationRepository';
import { Conversation } from '../../entities/conversation';

export class CreateConversation {
  constructor(private conversationRepository: ConversationRepository) {}

  async execute(participants: string[]): Promise<Conversation> {
    const conversation: Conversation = {
      id: '',
      participants,
      lastMessageAt: new Date(),
    };
    return this.conversationRepository.create(conversation);
  }
} 