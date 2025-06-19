import mongoose, { Document, Schema } from 'mongoose';

export interface AttachmentDocument extends Document {
  filename: string;
  url: string;
  type: 'image' | 'pdf' | 'other';
  uploadedAt: Date;
  uploadedBy: string;
}

const AttachmentSchema = new Schema<AttachmentDocument>({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'pdf', 'other'], required: true },
  uploadedAt: { type: Date, required: true },
  uploadedBy: { type: String, required: true },
});

export const AttachmentModel = mongoose.model<AttachmentDocument>('Attachment', AttachmentSchema); 