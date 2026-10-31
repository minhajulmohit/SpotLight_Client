import { NextResponse } from "next/server";

const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to submit booking:", error);
    return NextResponse.json(
      { message: "Could not connect to the bookings API." },
      { status: 502 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const query = email ? `?email=${encodeURIComponent(email)}` : "";

    const response = await fetch(`${API_BASE}/bookings${query}`, {
      cache: "no-store",
    });
    const data = await response.json().catch(() => []);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { message: "Could not fetch bookings from server." },
      { status: 502 },
    );
  }
}
