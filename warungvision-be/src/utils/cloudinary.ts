import { v2 as cloudinary } from "cloudinary";

export class CloudinaryService {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  /**
   * Upload an image from base64 string
   * @param base64Image Base64 encoded image string
   * @param fileName Optional file name for the upload
   * @returns Upload result with secure URL
   */
  async uploadBase64(
    base64Image: string,
    fileName?: string
  ): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Image}`,
        {
          folder: "warung-vision/scans",
          resource_type: "auto",
          public_id: fileName
            ? `${fileName}-${Date.now()}`
            : `scan-${Date.now()}`,
          overwrite: false,
          quality: "auto",
          fetch_format: "auto",
        }
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  }

  /**
   * Upload image from file path
   * @param filePath Path to the image file
   * @param fileName Optional file name for the upload
   * @returns Upload result with secure URL
   */
  async uploadFile(
    filePath: string,
    fileName?: string
  ): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "warung-vision/scans",
        resource_type: "auto",
        public_id: fileName
          ? `${fileName}-${Date.now()}`
          : `scan-${Date.now()}`,
        overwrite: false,
        quality: "auto",
        fetch_format: "auto",
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  }

  /**
   * Delete an image by public ID
   * @param publicId The public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw error;
    }
  }

  /**
   * Get image metadata
   * @param publicId The public ID of the image
   */
  async getImageMetadata(publicId: string) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error("Cloudinary metadata error:", error);
      throw error;
    }
  }
}

export const createCloudinaryService = () => new CloudinaryService();
