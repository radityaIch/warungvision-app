import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export class InsightService {
  async getDailyInsights(storeId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stockHistory = await prisma.stockHistory.findMany({
      where: {
        product: {
          storeId,
        },
        date: {
          gte: startDate,
        },
      },
      include: {
        product: {
          select: { sku: true, name: true },
        },
        user: {
          select: { name: true },
        },
      },
      orderBy: { date: "asc" },
    });

    return {
      period: `${days} hari terakhir`,
      totalTransactions: stockHistory.length,
      data: stockHistory,
    };
  }

  async getScanInsights(storeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const scanEvents = await prisma.scanEvent.findMany({
      where: {
        user: {
          storeId,
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    let totalItems = 0;
    let completedScans = 0;
    let failedScans = 0;

    const statusCount: any = {
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    scanEvents.forEach((scan) => {
      const itemCount = scan.items.reduce((sum, item) => sum + item.count, 0);
      totalItems += itemCount;

      if (scan.status === "completed") completedScans++;
      if (scan.status === "failed") failedScans++;

      statusCount[scan.status]++;
    });

    return {
      period: `${days} hari terakhir`,
      totalScans: scanEvents.length,
      completedScans,
      failedScans,
      totalItems,
      successRate:
        scanEvents.length > 0
          ? (completedScans / scanEvents.length) * 100
          : 0,
      statusBreakdown: statusCount,
      recentScans: scanEvents.slice(0, 10),
    };
  }

  async getProductPerformance(storeId: string, limit: number = 10) {
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        scanItems: {
          select: { count: true },
        },
        stockHistory: {
          select: { delta: true, date: true },
        },
      },
      orderBy: {
        scanItems: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      currentStock: product.stock,
      price: product.price,
      totalScanned: product.scanItems.reduce(
        (sum, item) => sum + item.count,
        0
      ),
      totalStockMovements: product.stockHistory.length,
    }));
  }

  async getInventoryTrends(storeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stockHistory = await prisma.stockHistory.findMany({
      where: {
        product: {
          storeId,
        },
        date: {
          gte: startDate,
        },
      },
      include: {
        product: {
          select: { sku: true, name: true, price: true },
        },
      },
      orderBy: { date: "asc" },
    });

    // Group by date
    const dailyTrends: any = {};

    stockHistory.forEach((record) => {
      const dateKey = record.date.toISOString().split("T")[0];

      if (!dailyTrends[dateKey]) {
        dailyTrends[dateKey] = {
          date: dateKey,
          totalMovement: 0,
          totalValue: 0,
          count: 0,
        };
      }

      dailyTrends[dateKey].totalMovement += record.delta;
      dailyTrends[dateKey].totalValue +=
        record.delta * record.product.price;
      dailyTrends[dateKey].count++;
    });

    return Object.values(dailyTrends);
  }

  async getUserActivity(storeId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await prisma.user.findMany({
      where: {
        storeId,
        isActive: true,
      },
      include: {
        scanEvents: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          select: { id: true, status: true },
        },
        stockHistory: {
          where: {
            date: {
              gte: startDate,
            },
          },
          select: { id: true },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      scanCount: user.scanEvents.length,
      stockUpdates: user.stockHistory.length,
      totalActions: user.scanEvents.length + user.stockHistory.length,
    }));
  }
}

export const insightService = new InsightService();
