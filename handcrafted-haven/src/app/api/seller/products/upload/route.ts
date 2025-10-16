export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromRequest, isSellerOrAdmin, isAdmin } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

function streamUpload(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "artisans" },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSellerOrAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const explicitSellerId = String(formData.get("sellerId") || "").trim() || null;
    const name = String(formData.get("name") || "");
    const price = String(formData.get("price") || "");
    const category = String(formData.get("category") || "");
    const imageFile = formData.get("image") as File | null;

    if (!name || !price) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Determine seller
    let targetSellerId: string | null = null;
    if (isAdmin(user) && explicitSellerId) {
      const s = await prisma.seller.findUnique({ where: { id: explicitSellerId } });
      if (!s) return NextResponse.json({ error: "Specified seller not found" }, { status: 404 });
      targetSellerId = s.id;
    } else {
      const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
      if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
      targetSellerId = seller.id;
    }

    // Upload image to Cloudinary
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await streamUpload(buffer);
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        category: category || null,
        image: imageUrl,
        sellerId: targetSellerId,
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("POST /api/seller/products/upload error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
