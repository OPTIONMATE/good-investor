import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  fileBuffer,
  filename,
  folder = "trademilaan/documents",
) {
  return new Promise((resolve, reject) => {
    const baseName = filename.replace(/\.[^/.]+$/, ""); // remove extension

    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: baseName,
          resource_type: "image", // IMPORTANT
          format: "pdf", // FORCE PDF FORMAT
          type: "upload",
          overwrite: true,
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary PDF upload error:", error);
            return reject(error);
          }

          resolve({
            publicId: result.public_id,
            url: result.secure_url, // viewable in browser
            format: result.format, // should be "pdf"
            resourceType: result.resource_type, // should be "image"
          });
        },
      )
      .end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId) {
  try {
    // delete as image not raw
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw error;
  }
}

export default cloudinary;
