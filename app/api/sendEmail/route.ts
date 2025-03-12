import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    // Add safety check for request body
    const body = await request.text();
    if (!body) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    // Safely parse JSON with error handling
    let data;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { email } = data;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await prisma.waitlist.findFirst({
      where: {
        email: email,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 400 }
      );
    }

    // If email doesn't exist, proceed with creating it
    await prisma.waitlist.create({
      data: {
        email,
      },
    });

    // Get total count and all emails
    const totalCount = await prisma.waitlist.count();
    const allEmails = await prisma.waitlist.findMany({
      select: { email: true },
      orderBy: { createdAt: "desc" },
    });

    // Send notification email using AWS SES
    const params = {
      Source: "info@voicero.ai",
      Destination: {
        ToAddresses: ["support@voicero.ai", "info@voicero.ai"],
      },
      Message: {
        Subject: {
          Data: "New Waitlist Signup",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: `New waitlist signup: ${email}\nTotal waitlist count: ${totalCount}\n\nAll Emails:\n${allEmails
              .map((e) => e.email)
              .join("\n")}`,
            Charset: "UTF-8",
          },
          Html: {
            Data: `
              <h2>New Waitlist Signup</h2>
              <p>A new user has joined the waitlist:</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Total Waitlist Count:</strong> ${totalCount}</p>
              <p>Time: ${new Date().toLocaleString()}</p>
              <h3>All Waitlist Emails:</h3>
              <ul>
                ${allEmails.map((e) => `<li>${e.email}</li>`).join("")}
              </ul>
            `,
            Charset: "UTF-8",
          },
        },
      },
    };

    await ses.send(new SendEmailCommand(params));

    return NextResponse.json(
      { message: "Successfully joined waitlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist submission error:", error);

    // Check if it's a Prisma unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error as any).name === "PrismaClientKnownRequestError" &&
      (error as any).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 400 }
      );
    }

    // Handle other errors
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
