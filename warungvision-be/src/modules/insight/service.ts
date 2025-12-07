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

  /**
   * Get restock recommendations based on trends and low stock
   */
  async getRestockRecommendations(storeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        stockHistory: {
          where: {
            date: {
              gte: startDate,
            },
          },
          select: { delta: true, date: true },
        },
      },
    });

    const recommendations = products
      .map((product) => {
        // Calculate average daily consumption
        const totalConsumption = Math.abs(
          product.stockHistory
            .filter((h) => h.delta < 0)
            .reduce((sum, h) => sum + h.delta, 0)
        );
        const averageDailyConsumption = totalConsumption / days;

        // Estimate days until stockout (if trending negatively)
        const daysUntilStockout =
          averageDailyConsumption > 0
            ? Math.ceil(product.stock / averageDailyConsumption)
            : null;

        // Determine if restock is needed
        const needsRestock =
          product.stock <= 5 || (daysUntilStockout ? daysUntilStockout <= 7 : false);

        return {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          currentStock: product.stock,
          price: product.price,
          averageDailyConsumption: Math.round(averageDailyConsumption * 100) / 100,
          daysUntilStockout,
          needsRestock,
          priority: daysUntilStockout ? (daysUntilStockout <= 3 ? "HIGH" : "MEDIUM") : "LOW",
          suggestedRestockQuantity: Math.max(
            10,
            Math.ceil(averageDailyConsumption * 14)
          ), // 2 weeks supply
        };
      })
      .filter((r) => r.needsRestock)
      .sort((a, b) => {
        // Sort by priority: HIGH > MEDIUM > LOW
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        );
      });

    return {
      totalRecommendations: recommendations.length,
      recommendations,
      period: `${days} hari terakhir`,
      generatedAt: new Date(),
    };
  }

  /**
   * Get sales insights and spending estimates
   */
  async getSalesInsights(storeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all stock movements
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
          select: { price: true, name: true, sku: true },
        },
      },
    });

    // Calculate spending estimate (negative deltas = sales/consumption)
    let totalSpendingEstimate = 0;
    let totalItemsSold = 0;
    const topSoldProducts: any = {};

    stockHistory.forEach((record) => {
      if (record.delta < 0) {
        const itemsSold = Math.abs(record.delta);
        const spending = itemsSold * record.product.price;

        totalSpendingEstimate += spending;
        totalItemsSold += itemsSold;

        // Track top sold products
        if (!topSoldProducts[record.productId]) {
          topSoldProducts[record.productId] = {
            sku: record.product.sku,
            name: record.product.name,
            itemsSold: 0,
            totalValue: 0,
          };
        }
        topSoldProducts[record.productId].itemsSold += itemsSold;
        topSoldProducts[record.productId].totalValue += spending;
      }
    });

    // Calculate daily average
    const averageDailySpending = totalSpendingEstimate / days;
    const averageDailyItems = totalItemsSold / days;

    // Sort top products
    const topProducts = Object.values(topSoldProducts)
      .sort((a: any, b: any) => b.itemsSold - a.itemsSold)
      .slice(0, 10);

    return {
      period: `${days} hari terakhir`,
      totalSpendingEstimate: Math.round(totalSpendingEstimate * 100) / 100,
      totalItemsSold: Math.round(totalItemsSold),
      averageDailySpending: Math.round(averageDailySpending * 100) / 100,
      averageDailyItems: Math.round(averageDailyItems * 100) / 100,
      projectedMonthlySpending:
        Math.round(averageDailySpending * 30 * 100) / 100,
      topSoldProducts: topProducts,
      generatedAt: new Date(),
    };
  }
}

export const insightService = new InsightService();
