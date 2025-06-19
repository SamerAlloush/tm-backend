import mongoose, { Document, Schema } from 'mongoose';

export interface EmployeeDocument extends Document {
  nom: string;
  prenom: string;
  date_naissance: Date;
  poste: string;
  email: string;
  telephone: string;
  adresse: string;
  date_embauche: Date;
  statut: string;
}

const EmployeeSchema = new Schema<EmployeeDocument>({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  date_naissance: { type: Date },
  poste: { type: String },
  email: { type: String, required: true, unique: true },
  telephone: { type: String },
  adresse: { type: String },
  date_embauche: { type: Date },
  statut: { type: String },
});

export const EmployeeModel = mongoose.model<EmployeeDocument>('Employee', EmployeeSchema); 