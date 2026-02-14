import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const { type, title, description, content, email, tags } = body;

  if (!type || !title || !description || !content || !email) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  console.log("New proposal received:", {
    type,
    title,
    description,
    content: content.substring(0, 100) + "...",
    email,
    tags,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
