import { Attachment } from '../entities/attachment';

export interface AttachmentRepository {
  create(attachment: Attachment): Promise<Attachment>;
  findById(id: string): Promise<Attachment | null>;
  findByUser(userId: string): Promise<Attachment[]>;
  delete(id: string): Promise<void>;
} 