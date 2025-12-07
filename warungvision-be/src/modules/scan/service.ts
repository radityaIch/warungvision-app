import { ScanRepository } from "./repository";
import { CreateScanEventDto, AddScanItemDto } from "./dto";
import { AppError } from "../../utils/errors";
import { KolosalService } from "../../utils/kolosal";
import { CloudinaryService } from "../../utils/cloudinary";

const scanRepo = new ScanRepository();
let kolosalService: KolosalService;
let cloudinaryService: CloudinaryService;

try {
  kolosalService = new KolosalService();
  cloudinaryService = new CloudinaryService();
} catch (error) {
  console.warn(
    "Warning: Kolosal or Cloudinary services not fully configured:",
    error
  );
}

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

  /**
   * Upload and process image with AI detection
   * @param scanEventId The scan event to attach results to
   * @param base64Image Base64 encoded image
   * @param prompts Optional array of detection prompts (e.g., ["product", "bottle", "box"])
   * @returns Detected products and scan results
   */
  async uploadAndProcessImage(scanEventId: string, base64Image: string, prompts?: string[]) {
    // Verify scan event exists
    const scanEvent = await scanRepo.findScanEventById(scanEventId);
    if (!scanEvent) {
      throw new AppError(404, `Scan event tidak ditemukan: ${scanEventId}`);
    }

    if (scanEvent.status !== "queued") {
      throw new AppError(400, `Scan harus dalam status queued, bukan ${scanEvent.status}`);
    }

    try {
      // Update status to processing
      await scanRepo.updateScanStatus(scanEventId, "processing");

      // If services are not configured, return mock data for testing
      if (!kolosalService || !cloudinaryService) {
        console.warn("⚠️ AI services not configured - using mock detection results for testing");
        
        const mockResults = [
          { name: "Product A", confidence: 0.92, bbox: [10, 20, 100, 150] },
          { name: "Product B", confidence: 0.87, bbox: [120, 30, 200, 160] },
          { name: "Bottle", confidence: 0.95, bbox: [220, 50, 280, 180] },
        ];

        const mockUrl = `https://via.placeholder.com/400x300?text=Mock+Scan+${scanEventId}`;
        
        const scanResults = await Promise.all(
          mockResults.map((result) =>
            scanRepo.saveScanResult({
              scanEventId,
              productName: result.name,
              confidence: result.confidence,
              bboxX1: result.bbox[0],
              bboxY1: result.bbox[1],
              bboxX2: result.bbox[2],
              bboxY2: result.bbox[3],
              estimatedCount: 1,
            })
          )
        );

        await scanRepo.updateScanEventImage(scanEventId, mockUrl, "mock-id", 250);

        return {
          scanEventId,
          imageUrl: mockUrl,
          detectionResults: mockResults,
          scanResults,
          processingTimeMs: 250,
          totalObjectsDetected: mockResults.length,
          mockMode: true,
        };
      }

      // Upload image to Cloudinary
      console.log("Uploading image to Cloudinary...");
      const { url: imageUrl, publicId } =
        await cloudinaryService.uploadBase64(base64Image);
      console.log("✅ Image uploaded to Cloudinary:", imageUrl);

      // Process image with Kolosal AI
      console.log("Processing image with Kolosal AI...");
      let detectionResult;
      try {
        detectionResult = await kolosalService.detectObjectsFromBase64(
          base64Image,
          prompts
        );
      } catch (kolosalError) {
        console.error("❌ Kolosal API Error:", kolosalError);
        throw new AppError(
          500,
          `AI Detection failed: ${kolosalError instanceof Error ? kolosalError.message : "Unknown error"}`
        );
      }

      if (!detectionResult || !detectionResult.results) {
        throw new AppError(500, "Failed to detect objects in image - Invalid response from AI");
      }

      console.log("✅ AI Detection complete:", {
        objectsFound: detectionResult.results.length,
        processingTime: detectionResult.processing_time_ms,
      });

      // Save scan results
      const scanResults = await Promise.all(
        detectionResult.results.map((result) =>
          scanRepo.saveScanResult({
            scanEventId,
            productName: result.name,
            confidence: result.confidence,
            bboxX1: result.bbox[0],
            bboxY1: result.bbox[1],
            bboxX2: result.bbox[2],
            bboxY2: result.bbox[3],
            estimatedCount: 1,
          })
        )
      );

      // Update scan event with image info
      const updatedScanEvent = await scanRepo.updateScanEventImage(
        scanEventId,
        imageUrl,
        publicId,
        detectionResult.processing_time_ms
      );

      return {
        scanEventId,
        imageUrl,
        detectionResults: detectionResult.results,
        scanResults,
        processingTimeMs: detectionResult.processing_time_ms,
        totalObjectsDetected: detectionResult.results.length,
      };
    } catch (error) {
      // Update status to failed
      await scanRepo.updateScanStatus(scanEventId, "failed");
      
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error("❌ Error in uploadAndProcessImage:", error);
      throw new AppError(
        500,
        `Image processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export const scanService = new ScanService();
