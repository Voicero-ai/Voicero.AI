import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await prisma.website.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete website error:", error);
    return NextResponse.json(
      { error: "Failed to delete website" },
      { status: 500 }
    );
  }
}
