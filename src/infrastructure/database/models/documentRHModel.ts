import mongoose, { Document, Schema } from 'mongoose';

export interface DocumentRHDocument extends Document {
  employe_id: mongoose.Types.ObjectId;
  type_document: string;
  url_document: string;
  date_upload: Date;
}

const DocumentRHSchema = new Schema<DocumentRHDocument>({
  employe_id: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  type_document: { type: String },
  url_document: { type: String },
  date_upload: { type: Date },
});

export const DocumentRHModel = mongoose.model<DocumentRHDocument>('DocumentRH', DocumentRHSchema); 