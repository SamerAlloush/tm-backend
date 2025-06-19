import { Request, Response } from 'express';
import { MessageRepositoryImpl } from '../../infrastructure/database/repositories/messageRepositoryImpl';
import { SendMessage } from '../../domain/usecases/message/sendMessage';
import { GetMessagesForConversation } from '../../domain/usecases/message/getMessagesForConversation';

const messageRepo = new MessageRepositoryImpl();

export class MessageController {
  static async send(req: Request, res: Response) {
    const { conversationId, senderId, content, attachments } = req.body;
    try {
      const useCase = new SendMessage(messageRepo);
      const message = await useCase.execute(conversationId, senderId, content, attachments);
      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ error: 'Failed to send message', details: err });
    }
  }

  static async list(req: Request, res: Response) {
    const { conversationId } = req.query;
    try {
      const useCase = new GetMessagesForConversation(messageRepo);
      const messages = await useCase.execute(conversationId as string);
      res.json(messages);
    } catch (err) {
      res.status(400).json({ error: 'Failed to fetch messages', details: err });
    }
  }
} 