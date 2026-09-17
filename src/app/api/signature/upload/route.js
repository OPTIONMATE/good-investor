import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/app/lib/db";
import { requireAuth } from "@/app/lib/authServer";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, validateFileMagicBytes } from "@/app/lib/validators";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export async function POST(req) {
  try {
    // ✅ SECURITY: Require authentication
    const user = await requireAuth();

    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Validate file type (browser-reported)
    const allowedImageTypes = ALLOWED_MIME_TYPES.image;
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG and PNG are allowed" },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Validate file size
    if (file.size > MAX_FILE_SIZES.image) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ SECURITY: Validate file magic bytes (prevents spoofing)
    const magicValidation = validateFileMagicBytes(buffer, file.type);
    if (!magicValidation.valid) {
      return NextResponse.json(
        { error: magicValidation.error },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `signatures/${user.userId}`,
          resource_type: "auto",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (err, res) => {
          if (err) reject(err);
          else resolve(res);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Signature upload error:", error.message);
    return NextResponse.json(
      { error: error.statusCode === 403 ? "Forbidden" : "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}
