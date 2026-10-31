import { NextResponse } from "next/server";
import { connection } from "next/server";

const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export async function GET() {
  await connection();

  try {
    const response = await fetch(`${API_BASE}/all-studio`, {
      cache: "no-store",
    });
    const data = await response.json().catch(() => []);

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message ?? "Studios could not be loaded." },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch studios:", error);
    return NextResponse.json(
      { message: "Could not connect to the studios API." },
      { status: 502 },
    );
  }
}
