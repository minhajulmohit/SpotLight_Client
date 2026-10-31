import { NextResponse } from "next/server";

const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action ?? "cancel";

    const endpoint =
      action === "cancel"
        ? `${API_BASE}/bookings/${id}/cancel`
        : `${API_BASE}/bookings/${id}/status`;

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json(
      { message: "Could not connect to the bookings API." },
      { status: 502 },
    );
  }
}
