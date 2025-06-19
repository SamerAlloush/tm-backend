import mongoose, { Document, Schema } from 'mongoose';

export interface ProductDocument extends Document {
  name: string;
  description: string;
  price: number;
  ownerId: string;
}

const ProductSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  ownerId: { type: String, required: true },
});

export const ProductModel = mongoose.model<ProductDocument>('Product', ProductSchema); 