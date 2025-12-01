import { ScanRepository } from "./repository";
import { CreateScanEventDto, AddScanItemDto } from "./dto";
import { AppError } from "../../utils/errors";

const scanRepo = new ScanRepository();

export class ScanService {
  async createScanEvent(createScanEventDto: CreateScanEventDto) {
    const scanEvent = await scanRepo.createScanEvent(
      createScanEventDto.userId
    );

    return {
      id: scanEvent.id,
      status: scanEvent.status,
      createdAt: scanEvent.createdAt,
    };
  }

  async getScanEvent(id: string) {
    const scanEvent = await scanRepo.findScanEventById(id);

    if (!scanEvent) {
      throw new AppError(404, `Scan event dengan id ${id} tidak ditemukan`);
    }

    return scanEvent;
  }

  async getAllScanEvents(userId?: string) {
    return scanRepo.findAllScanEvents(userId);
  }

  async addItemToScan(scanEventId: string, addScanItemDto: AddScanItemDto) {
    const scanEvent = await scanRepo.findScanEventById(scanEventId);

    if (!scanEvent) {
      throw new AppError(
        404,
        `Scan event dengan id ${scanEventId} tidak ditemukan`
      );
    }

    if (scanEvent.status !== "queued") {
      throw new AppError(
        400,
        `Tidak bisa menambah item ke scan yang sudah ${scanEvent.status}`
      );
    }

    const item = await scanRepo.addItemToScan(
      scanEventId,
      addScanItemDto.productId,
      addScanItemDto.count
    );

    return {
      id: item.id,
      productId: item.productId,
      count: item.count,
    };
  }

  async removeScanItem(itemId: string) {
    const item = await scanRepo.removeScanItem(itemId);
    return { success: true, id: item.id };
  }

  async completeScan(scanEventId: string) {
    const scanEvent = await scanRepo.findScanEventById(scanEventId);

    if (!scanEvent) {
      throw new AppError(
        404,
        `Scan event dengan id ${scanEventId} tidak ditemukan`
      );
    }

    const updated = await scanRepo.updateScanStatus(scanEventId, "completed");

    return {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }

  async cancelScan(scanEventId: string) {
    const scanEvent = await scanRepo.findScanEventById(scanEventId);

    if (!scanEvent) {
      throw new AppError(
        404,
        `Scan event dengan id ${scanEventId} tidak ditemukan`
      );
    }

    await scanRepo.deleteScanEvent(scanEventId);

    return { success: true, message: "Scan berhasil dibatalkan" };
  }

  async getQueuedScans() {
    return scanRepo.getScansByStatus("queued");
  }

  async getProcessingScans() {
    return scanRepo.getScansByStatus("processing");
  }
}

export const scanService = new ScanService();
