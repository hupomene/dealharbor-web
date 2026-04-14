import { NextRequest, NextResponse } from "next/server";

const ENGINE_BASE_URL =
  process.env.CONTRACT_ENGINE_URL ?? "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const upstream = await fetch(`${ENGINE_BASE_URL}/generate-document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const arrayBuffer = await upstream.arrayBuffer();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Contract engine failed to generate document." },
        { status: upstream.status }
      );
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ??
          "application/octet-stream",
        "Content-Disposition":
          upstream.headers.get("content-disposition") ??
          'attachment; filename="document.bin"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach contract engine." },
      { status: 500 }
    );
  }
}