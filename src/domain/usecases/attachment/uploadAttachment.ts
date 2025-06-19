import { AttachmentRepository } from '../../repositories/attachmentRepository';
import { Attachment } from '../../entities/attachment';

export class UploadAttachment {
  constructor(private attachmentRepository: AttachmentRepository) {}

  async execute(filename: string, url: string, type: 'image' | 'pdf' | 'other', uploadedBy: string): Promise<Attachment> {
    const attachment: Attachment = {
      id: '',
      filename,
      url,
      type,
      uploadedAt: new Date(),
      uploadedBy,
    };
    return this.attachmentRepository.create(attachment);
  }
} 