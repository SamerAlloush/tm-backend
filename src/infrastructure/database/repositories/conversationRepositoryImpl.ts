import { ConversationRepository } from '../../../domain/repositories/conversationRepository';
import { Conversation } from '../../../domain/entities/conversation';
import { ConversationModel } from '../models/conversationModel';

export class ConversationRepositoryImpl implements ConversationRepository {
  async create(conversation: Conversation): Promise<Conversation> {
    const created = await ConversationModel.create(conversation);
    const obj = created.toObject();
    return { ...obj, id: String(obj._id) };
  }
  async findById(id: string): Promise<Conversation | null> {
    const conversation = await ConversationModel.findById(id);
    if (!conversation) return null;
    const obj = conversation.toObject();
    return { ...obj, id: String(obj._id) };
  }
  async findByParticipant(userId: string): Promise<Conversation[]> {
    const conversations = await ConversationModel.find({ participants: userId });
    return conversations.map((c) => {
      const obj = c.toObject();
      return { ...obj, id: String(obj._id) };
    });
  }
  async update(conversation: Conversation): Promise<Conversation> {
    const updated = await ConversationModel.findByIdAndUpdate(conversation.id, conversation, { new: true });
    const obj = updated!.toObject();
    return { ...obj, id: String(obj._id) };
  }
  async delete(id: string): Promise<void> {
    await ConversationModel.findByIdAndDelete(id);
  }
} 