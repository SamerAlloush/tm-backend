import { ProductRepository } from '../../../domain/repositories/productRepository';
import { Product } from '../../../domain/entities/product';
import { ProductModel } from '../models/productModel';

export class ProductRepositoryImpl implements ProductRepository {
  async create(product: Product): Promise<Product> {
    const created = await ProductModel.create(product);
    const obj = created.toObject();
    return { ...obj, id: String(obj._id) };
  }

  async findById(id: string): Promise<Product | null> {
    const product = await ProductModel.findById(id);
    if (!product) return null;
    const obj = product.toObject();
    return { ...obj, id: String(obj._id) };
  }

  async findAll(): Promise<Product[]> {
    const products = await ProductModel.find();
    return products.map((product) => {
      const obj = product.toObject();
      return { ...obj, id: String(obj._id) };
    });
  }

  async update(product: Product): Promise<Product> {
    const updated = await ProductModel.findByIdAndUpdate(product.id, product, { new: true });
    const obj = updated!.toObject();
    return { ...obj, id: String(obj._id) };
  }

  async delete(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  }
} 