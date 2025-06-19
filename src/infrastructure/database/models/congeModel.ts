import mongoose, { Document, Schema } from 'mongoose';

export interface CongeDocument extends Document {
  employe_id: mongoose.Types.ObjectId;
  date_debut: Date;
  date_fin: Date;
  statut: string;
  type: string;
}

const CongeSchema = new Schema<CongeDocument>({
  employe_id: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  date_debut: { type: Date },
  date_fin: { type: Date },
  statut: { type: String },
  type: { type: String },
});

export const CongeModel = mongoose.model<CongeDocument>('Conge', CongeSchema); 