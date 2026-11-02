import { notFound } from "next/navigation";

import StudioDetailsClient, {
  type StudioDetails,
} from "./StudioDetailsClient";

export type { StudioDetails };

type PageProps = {
  params: Promise<{ id: string }>;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const getStudio = async (id: string): Promise<StudioDetails> => {
  if (!/^[\da-f]{24}$/i.test(id)) notFound();

  const response = await fetch(
    new URL(`/all-studio/${encodeURIComponent(id)}`, `${BACKEND_URL}/`),
    { cache: "no-store" },
  );

  if (response.status === 404) notFound();
  if (!response.ok) {
    throw new Error(`Studio request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as
    | StudioDetails
    | { studio?: StudioDetails }
    | null;
  if (!data) notFound();

  let studio: StudioDetails;
  if ("title" in data) {
    studio = data;
  } else {
    if (!data.studio) notFound();
    studio = data.studio;
  }
  return studio;
};

export default async function StudioDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const studio = await getStudio(id);

  return <StudioDetailsClient studio={studio} />;
}
