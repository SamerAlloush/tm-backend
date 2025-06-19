import { OrderRepository } from '../../../domain/repositories/orderRepository';
import { Order } from '../../../domain/entities/order';
import { OrderModel } from '../models/orderModel';

export class OrderRepositoryImpl implements OrderRepository {
  async create(order: Order): Promise<Order> {
    const created = await OrderModel.create(order);
    const obj = created.toObject();
    return { ...obj, id: String(obj._id) };
  }

  async findById(id: string): Promise<Order | null> {
    const order = await OrderModel.findById(id);
    if (!order) return null;
    const obj = order.toObject();
    return { ...obj, id: String(obj._id) };
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ userId });
    return orders.map((order) => {
      const obj = order.toObject();
      return { ...obj, id: String(obj._id) };
    });
  }

  async update(order: Order): Promise<Order> {
    const updated = await OrderModel.findByIdAndUpdate(order.id, order, { new: true });
    const obj = updated!.toObject();
    return { ...obj, id: String(obj._id) };
  }

  async delete(id: string): Promise<void> {
    await OrderModel.findByIdAndDelete(id);
  }
} 