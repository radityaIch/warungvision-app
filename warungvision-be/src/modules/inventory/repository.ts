import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export class InventoryRepository {
  async createProduct(data: any) {
    return prisma.product.create({
      data,
    });
  }

  async findProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  async findProductBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  async findAllProductsByStore(storeId: string) {
    return prisma.product.findMany({
      where: { storeId },
      orderBy: { name: "asc" },
    });
  }

  async updateProduct(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(id: string, delta: number) {
    const product = await this.findProductById(id);
    const newStock = Math.max(0, (product?.stock || 0) + delta);

    return prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });
  }

  async recordStockHistory(
    productId: string,
    userId: string,
    stock: number,
    delta: number
  ) {
    return prisma.stockHistory.create({
      data: {
        productId,
        userId,
        stock,
        delta,
      },
    });
  }

  async getStockHistory(
    productId?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    return prisma.stockHistory.findMany({
      where: {
        productId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: {
          select: { sku: true, name: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  async getProductStats(storeId: string) {
    const products = await prisma.product.findMany({
      where: { storeId },
    });

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.stock,
      0
    );

    return {
      totalProducts,
      totalStock,
      totalValue,
    };
  }

  async getLowStockProducts(storeId: string, threshold: number = 5) {
    return prisma.product.findMany({
      where: {
        storeId,
        stock: {
          lte: threshold,
        },
      },
    });
  }
}
