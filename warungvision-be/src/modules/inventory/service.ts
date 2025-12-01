import { InventoryRepository } from "./repository";
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from "./dto";
import { AppError } from "../../utils/errors";

const inventoryRepo = new InventoryRepository();

export class InventoryService {
  async createProduct(createProductDto: CreateProductDto) {
    const existingSku = await inventoryRepo.findProductBySku(
      createProductDto.sku
    );
    if (existingSku) {
      throw new AppError(400, "SKU sudah terdaftar");
    }

    const product = await inventoryRepo.createProduct(createProductDto);

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      stock: product.stock,
    };
  }

  async getProduct(id: string) {
    const product = await inventoryRepo.findProductById(id);
    if (!product) {
      throw new AppError(404, `Product dengan id ${id} tidak ditemukan`);
    }
    return product;
  }

  async getProductsBySku(sku: string) {
    const product = await inventoryRepo.findProductBySku(sku);
    if (!product) {
      throw new AppError(404, `Product dengan SKU ${sku} tidak ditemukan`);
    }
    return product;
  }

  async getAllProductsByStore(storeId: string) {
    return inventoryRepo.findAllProductsByStore(storeId);
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const product = await inventoryRepo.findProductById(id);
    if (!product) {
      throw new AppError(404, `Product dengan id ${id} tidak ditemukan`);
    }

    const updated = await inventoryRepo.updateProduct(id, updateProductDto);
    return updated;
  }

  async deleteProduct(id: string) {
    const product = await inventoryRepo.findProductById(id);
    if (!product) {
      throw new AppError(404, `Product dengan id ${id} tidak ditemukan`);
    }

    await inventoryRepo.deleteProduct(id);
    return { success: true, message: "Product berhasil dihapus" };
  }

  async updateStock(id: string, userId: string, updateStockDto: UpdateStockDto) {
    const product = await inventoryRepo.findProductById(id);
    if (!product) {
      throw new AppError(404, `Product dengan id ${id} tidak ditemukan`);
    }

    const updatedProduct = await inventoryRepo.updateStock(
      id,
      updateStockDto.delta
    );

    // Record stock history
    await inventoryRepo.recordStockHistory(
      id,
      userId,
      updatedProduct.stock,
      updateStockDto.delta
    );

    return {
      id: updatedProduct.id,
      stock: updatedProduct.stock,
    };
  }

  async getStockHistory(
    productId?: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return inventoryRepo.getStockHistory(productId, start, end);
  }

  async getInventoryStats(storeId: string) {
    return inventoryRepo.getProductStats(storeId);
  }

  async getLowStockProducts(storeId: string, threshold: number = 5) {
    return inventoryRepo.getLowStockProducts(storeId, threshold);
  }
}

export const inventoryService = new InventoryService();
