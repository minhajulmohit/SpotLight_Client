import { NextResponse } from "next/server";
import { connection } from "next/server";

const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  await connection();

  try {
    const response = await fetch(
      `${API_BASE}/all-studio/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message ?? "Studio could not be found." },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch studio details:", error);
    return NextResponse.json(
      { message: "Could not connect to the studios API." },
      { status: 502 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const response = await fetch(
      `${API_BASE}/all-studio/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to update studio:", error);
    return NextResponse.json(
      { message: "Could not connect to the studios API." },
      { status: 502 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const response = await fetch(
      `${API_BASE}/all-studio/${encodeURIComponent(id)}`,
      { method: "DELETE", cache: "no-store" },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to delete studio:", error);
    return NextResponse.json(
      { message: "Could not connect to the studios API." },
      { status: 502 },
    );
  }
}
