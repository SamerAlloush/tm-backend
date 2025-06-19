import { MessageRepository } from '../../../domain/repositories/messageRepository';
import { Message } from '../../../domain/entities/message';
import { MessageModel } from '../models/messageModel';

export class MessageRepositoryImpl implements MessageRepository {
  async create(message: Message): Promise<Message> {
    const created = await MessageModel.create(message);
    const obj = created.toObject();
    return { ...obj, id: String(obj._id) };
  }
  async findById(id: string): Promise<Message | null> {
    const message = await MessageModel.findById(id);
    if (!message) return null;
    const obj = message.toObject();
    return { ...obj, id: String(obj._id) };
  }
  async findByConversation(conversationId: string): Promise<Message[]> {
    const messages = await MessageModel.find({ conversationId });
    return messages.map((m) => {
      const obj = m.toObject();
      return { ...obj, id: String(obj._id) };
    });
  }
  async update(message: Message): Promise<Message> {
    const updated = await MessageModel.findByIdAndUpdate(message.id, message, { new: true });
    const obj = updated!.toObject();
    return { ...obj, id: String(obj._id) };
  }
  async delete(id: string): Promise<void> {
    await MessageModel.findByIdAndDelete(id);
  }
} 