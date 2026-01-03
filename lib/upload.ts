// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "duax3iitp",
  api_key: process.env.CLOUDINARY_API_KEY || "147271578252216",
  api_secret: process.env.CLOUDINARY_API_SECRET, // Must be in .env
});

/**
 * Upload base64 image to Cloudinary
 * @param base64Image - Base64 encoded image string (without data:image prefix)
 * @param fileName - Optional custom filename
 * @returns Public URL of uploaded image
 */
export async function uploadImageToCloudinary(
  base64Image: string,
  fileName?: string
): Promise<string> {
  try {
    // Add data URI prefix if not present
    const dataUri = base64Image.startsWith("data:")
      ? base64Image
      : `data:image/png;base64,${base64Image}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "farcaster-thumbnails", // Organize in folder
      public_id: fileName || `thumbnail_${Date.now()}`,
      resource_type: "image",
      // Auto optimize
      transformation: [
        { quality: "auto", fetch_format: "auto" }, // Auto format & quality
      ],
    });

    console.log("✅ Image uploaded:", uploadResult.secure_url);

    return uploadResult.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Upload and get optimized URL
 */
export async function uploadAndOptimize(base64Image: string): Promise<{
  url: string;
  publicId: string;
  optimizedUrl: string;
}> {
  try {
    const dataUri = base64Image.startsWith("data:")
      ? base64Image
      : `data:image/png;base64,${base64Image}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "farcaster-thumbnails",
      public_id: `thumbnail_${Date.now()}`,
    });

    // Generate optimized URL
    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
      width: 500,
      height: 281,
      crop: "fill",
      gravity: "auto",
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      optimizedUrl,
    };
  } catch (error) {
    console.error("❌ Upload & optimize error:", error);
    throw new Error("Failed to process image");
  }
}

/**
 * Delete image from Cloudinary (optional - for cleanup)
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("❌ Delete error:", error);
    return false;
  }
}
