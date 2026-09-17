import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    // Get the proof file from FormData
    const formData = await req.formData();
    const proofFile = formData.get("proofFile");

    if (!proofFile) {
      return NextResponse.json(
        { message: "Payment proof file is required" },
        { status: 400 },
      );
    }

    // Get user from token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Upload proof to Cloudinary
    const bytes = await proofFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "trademilaan/payment-proofs",
          resource_type: "auto",
          public_id: `payment_${user._id}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(buffer);
    });

    // Save payment proof to user record
    if (!user.paymentProofs) {
      user.paymentProofs = [];
    }

    user.paymentProofs.push({
      fileUrl: uploadResult.secure_url,
      fileName: proofFile.name,
      uploadedAt: new Date(),
      status: "pending", // pending, verified, rejected
    });

    await user.save();

    return NextResponse.json(
      {
        message: "Payment proof uploaded successfully",
        proofUrl: uploadResult.secure_url,
        status: "pending",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json(
      { message: "Failed to process payment proof: " + err.message },
      { status: 500 },
    );
  }
}
