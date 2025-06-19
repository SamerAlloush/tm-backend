import { AttachmentRepository } from '../../../domain/repositories/attachmentRepository';
import { Attachment } from '../../../domain/entities/attachment';
import { AttachmentModel } from '../models/attachmentModel';

export class AttachmentRepositoryImpl implements AttachmentRepository {
  async create(attachment: Attachment): Promise<Attachment> {
    const created = await AttachmentModel.create(attachment);
    const obj = created.toObject();
    return { ...obj, id: String(obj._id) };
  }
  async findById(id: string): Promise<Attachment | null> {
    const attachment = await AttachmentModel.findById(id);
    if (!attachment) return null;
    const obj = attachment.toObject();
    return { ...obj, id: String(obj._id) };
  }
  async findByUser(userId: string): Promise<Attachment[]> {
    const attachments = await AttachmentModel.find({ uploadedBy: userId });
    return attachments.map(a => {
      const obj = a.toObject();
      return { ...obj, id: String(obj._id) };
    });
  }
  async delete(id: string): Promise<void> {
    await AttachmentModel.findByIdAndDelete(id);
  }
} 