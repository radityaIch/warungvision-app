import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export interface SaveScanResultInput {
  scanEventId: string;
  productName: string;
  confidence: number;
  bboxX1: number;
  bboxY1: number;
  bboxX2: number;
  bboxY2: number;
  estimatedCount: number;
}

export class ScanRepository {
  async createScanEvent(userId: string) {
    return prisma.scanEvent.create({
      data: {
        userId,
        status: "queued",
      },
    });
  }

  async findScanEventById(id: string) {
    return prisma.scanEvent.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        results: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAllScanEvents(userId?: string) {
    return prisma.scanEvent.findMany({
      where: userId ? { userId } : {},
      include: {
        items: {
          include: {
            product: true,
          },
        },
        results: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async addItemToScan(
    scanEventId: string,
    productId: string,
    count: number
  ) {
    return prisma.scanItem.create({
      data: {
        scanEventId,
        productId,
        count,
      },
    });
  }

  async removeScanItem(id: string) {
    return prisma.scanItem.delete({
      where: { id },
    });
  }

  async updateScanStatus(id: string, status: string) {
    return prisma.scanEvent.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async deleteScanEvent(id: string) {
    return prisma.scanEvent.delete({
      where: { id },
    });
  }

  async getScansByStatus(status: string) {
    return prisma.scanEvent.findMany({
      where: { status: status as any },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        results: true,
      },
    });
  }

  async saveScanResult(data: SaveScanResultInput) {
    return prisma.scanResult.create({
      data,
    });
  }

  async updateScanEventImage(
    scanEventId: string,
    imageUrl: string,
    imageCloudinaryId: string,
    processingTimeMs: number
  ) {
    return prisma.scanEvent.update({
      where: { id: scanEventId },
      data: {
        imageUrl,
        imageCloudinaryId,
        processingTimeMs,
        status: "completed",
      },
    });
  }
}
