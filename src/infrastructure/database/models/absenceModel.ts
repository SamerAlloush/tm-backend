import mongoose, { Document, Schema } from 'mongoose';

export interface AbsenceDocument extends Document {
  employe_id: mongoose.Types.ObjectId;
  type_absence: string;
  date_debut: Date;
  date_fin: Date;
  statut: string;
  commentaire: string;
}

const AbsenceSchema = new Schema<AbsenceDocument>({
  employe_id: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  type_absence: { type: String },
  date_debut: { type: Date },
  date_fin: { type: Date },
  statut: { type: String },
  commentaire: { type: String },
});

export const AbsenceModel = mongoose.model<AbsenceDocument>('Absence', AbsenceSchema); 