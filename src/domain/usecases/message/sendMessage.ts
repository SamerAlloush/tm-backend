import { MessageRepository } from '../../repositories/messageRepository';
import { Message } from '../../entities/message';

export class SendMessage {
  constructor(private messageRepository: MessageRepository) {}

  async execute(conversationId: string, senderId: string, content: string, attachments?: string[]): Promise<Message> {
    const message: Message = {
      id: '',
      conversationId,
      senderId,
      content,
      attachments,
      sentAt: new Date(),
      readBy: [senderId],
    };
    return this.messageRepository.create(message);
  }
} 