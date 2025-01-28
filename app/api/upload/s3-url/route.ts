import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate unique file name
    const fileType = request.headers.get("content-type") || "image/jpeg";
    const fileExtension = fileType.split("/")[1];
    const fileName = `${session.user.id}-${crypto
      .randomBytes(16)
      .toString("hex")}.${fileExtension}`;
    const key = `userProfiles/${fileName}`;

    // Create presigned URL
    const putObjectCommand = new PutObjectCommand({
      Bucket: "deepskygallery",
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 60,
    });

    return NextResponse.json({
      uploadUrl,
      key,
      bucketUrl: `https://deepskygallery.s3.us-east-2.amazonaws.com`,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
