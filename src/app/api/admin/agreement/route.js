import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/jwt";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import Agreement from "@/app/lib/models/Agreement";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/lib/cloudinary";

async function requireAdmin() {
  const cookieStore = await cookies(); // FIXED: await cookies()
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Unauthorized");

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new Error("Invalid token");
  }

  await connectDB();
  const user = await User.findById(decoded.id).select("role");
  if (!user || user.role !== "admin") throw new Error("Admin access required");

  return user;
}

// 📌 GET — List latest agreements
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const agreements = await Agreement.find()
      .select("version pdfUrl createdAt _id cloudinaryPublicId isActive")
      .sort({ version: -1 })
      .lean();

    return NextResponse.json({ agreements });
  } catch (err) {
    console.error("ADMIN AGREEMENT ERROR:", err);
    return NextResponse.json(
      { message: err.message },
      {
        status:
          err.message.includes("Unauthorized") ||
          err.message.includes("Invalid token") ||
          err.message.includes("Admin access required")
            ? 403
            : 500,
      },
    );
  }
}

// 📌 POST — Upload new agreement (versioning)
export async function POST(request) {
  try {
    await requireAdmin();
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    const cloudinaryResult = await uploadToCloudinary(
      buffer,
      safeName,
      "trademilaan/agreements",
    );

    const last = await Agreement.findOne().sort({ version: -1 });
    const newVersion = last ? last.version + 1 : 1;

    const agreement = await Agreement.create({
      version: newVersion,
      pdfUrl: cloudinaryResult.url,
      cloudinaryPublicId: cloudinaryResult.publicId,
    });

    return NextResponse.json({
      message: "Agreement uploaded successfully",
      agreement,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ message: "Failed to upload" }, { status: 500 });
  }
}

// 📌 DELETE — Remove agreement
export async function DELETE(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Agreement ID required" },
        { status: 400 },
      );
    }

    const agreement = await Agreement.findById(id);
    if (!agreement) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await deleteFromCloudinary(agreement.cloudinaryPublicId);
    await Agreement.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { message: err.message },
      {
        status:
          err.message.includes("Unauthorized") ||
          err.message.includes("Invalid token") ||
          err.message.includes("Admin access required")
            ? 403
            : 500,
      },
    );
  }
}
