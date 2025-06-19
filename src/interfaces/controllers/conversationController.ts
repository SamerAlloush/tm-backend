import { Request, Response } from 'express';
import { ConversationRepositoryImpl } from '../../infrastructure/database/repositories/conversationRepositoryImpl';
import { CreateConversation } from '../../domain/usecases/conversation/createConversation';
import { GetConversationsForUser } from '../../domain/usecases/conversation/getConversationsForUser';

const conversationRepo = new ConversationRepositoryImpl();

export class ConversationController {
  static async create(req: Request, res: Response) {
    const { participants } = req.body;
    try {
      const useCase = new CreateConversation(conversationRepo);
      const conversation = await useCase.execute(participants);
      res.status(201).json(conversation);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create conversation', details: err });
    }
  }

  static async list(req: Request, res: Response) {
    const { userId } = req.query;
    try {
      const useCase = new GetConversationsForUser(conversationRepo);
      const conversations = await useCase.execute(userId as string);
      res.json(conversations);
    } catch (err) {
      res.status(400).json({ error: 'Failed to fetch conversations', details: err });
    }
  }
} 