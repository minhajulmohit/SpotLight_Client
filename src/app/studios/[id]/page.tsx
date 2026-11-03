import { notFound } from "next/navigation";
import StudioDetailsClient, { type StudioDetails } from "./StudioDetailsClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

async function getStudio(id: string): Promise<StudioDetails> {
  try {
    const response = await fetch(`${BACKEND_URL}/all-studio/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      notFound();
    }

    const data = await response.json();
    const studio = data?.studio || data;

    if (!studio || !studio.title) {
      notFound();
    }

    return studio;
  } catch (error) {
    notFound();
  }
}


export default async function StudioDetailsPage({ params }: PageProps) {
  
  const { id } = await params;

  const studio = await getStudio(id);

  return <StudioDetailsClient studio={studio} />;
}
