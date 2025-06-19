import mongoose, { Document, Schema } from 'mongoose';

export interface OrderDocument extends Document {
  userId: string;
  productIds: string[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
}

const OrderSchema = new Schema<OrderDocument>({
  userId: { type: String, required: true },
  productIds: [{ type: String, required: true }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'], default: 'pending' },
});

export const OrderModel = mongoose.model<OrderDocument>('Order', OrderSchema); 